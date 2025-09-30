import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  ClientAnalytics,
  GlobalAnalytics,
  TrendAnalytics,
  PaymentPatterns
} from './interfaces/analytics.interfaces';

@Injectable()
export class DatabaseAnalyticsService {
  constructor(private prismaService: PrismaService) {}

  async getClientAnalytics(clientId: number): Promise<ClientAnalytics | null> {
    try {
      const client = await this.prismaService.client.findUnique({
        where: { id: clientId },
        include: {
          invoices: true
        }
      });

      if (!client) {
        return null;
      }

      const now = new Date();
      const totalInvoices = client.invoices.length;
      const totalAmount = client.invoices.reduce((sum, inv) => sum + inv.amount, 0);
      const paidInvoices = client.invoices.filter(inv => inv.paid);
      const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const unpaidAmount = totalAmount - paidAmount;
      const overdueCount = client.invoices.filter(
        inv => !inv.paid && new Date(inv.dueDate) < now
      ).length;
      const paymentRatio = totalInvoices > 0 ? paidInvoices.length / totalInvoices : 0;
      const averageInvoiceValue = totalInvoices > 0 ? totalAmount / totalInvoices : 0;
      
      // Calculate days since last invoice
      const lastInvoice = client.invoices.sort((a, b) => 
        new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      )[0];
      const daysSinceLastInvoice = lastInvoice 
        ? Math.floor((now.getTime() - new Date(lastInvoice.dueDate).getTime()) / (24 * 60 * 60 * 1000))
        : 365;

      return {
        clientId: client.id,
        email: client.email,
        name: client.name,
        totalInvoices,
        totalAmount,
        paidAmount,
        unpaidAmount,
        overdueCount,
        paymentRatio,
        averageInvoiceValue,
        daysSinceLastInvoice
      };
    } catch (error) {
      console.error('Client analytics error:', error);
      return null;
    }
  }

  async getGlobalAnalytics(): Promise<GlobalAnalytics> {
    try {
      const [
        totalClients,
        totalInvoices,
        allInvoices
      ] = await Promise.all([
        this.prismaService.client.count(),
        this.prismaService.invoice.count(),
        this.prismaService.invoice.findMany()
      ]);

      const now = new Date();
      const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);

      // Calculate active clients (clients with invoices in last 6 months)
      const activeClients = await this.prismaService.client.count({
        where: {
          invoices: {
            some: {
              dueDate: {
                gte: sixMonthsAgo
              }
            }
          }
        }
      });

      const inactiveClients = totalClients - activeClients;
      const totalRevenue = allInvoices
        .filter(inv => inv.paid)
        .reduce((sum, inv) => sum + inv.amount, 0);
      
      const outstandingAmount = allInvoices
        .filter(inv => !inv.paid)
        .reduce((sum, inv) => sum + inv.amount, 0);

      // Calculate average payment time (simplified - using due date vs current)
      const paidInvoices = allInvoices.filter(inv => inv.paid);
      const averagePaymentTime = paidInvoices.length > 0
        ? paidInvoices.reduce((sum, inv) => {
            const daysPastDue = Math.floor(
              (now.getTime() - new Date(inv.dueDate).getTime()) / (24 * 60 * 60 * 1000)
            );
            return sum + Math.max(0, daysPastDue);
          }, 0) / paidInvoices.length
        : 0;

      const churnRate = totalClients > 0 ? inactiveClients / totalClients : 0;

      return {
        totalClients,
        activeClients,
        inactiveClients,
        totalInvoices,
        totalRevenue,
        outstandingAmount,
        averagePaymentTime,
        churnRate
      };
    } catch (error) {
      console.error('Global analytics error:', error);
      return {
        totalClients: 0,
        activeClients: 0,
        inactiveClients: 0,
        totalInvoices: 0,
        totalRevenue: 0,
        outstandingAmount: 0,
        averagePaymentTime: 0,
        churnRate: 0
      };
    }
  }

  async getTrendAnalytics(months: number = 6): Promise<TrendAnalytics[]> {
    try {
      const trends: TrendAnalytics[] = [];
      const now = new Date();

      for (let i = 0; i < months; i++) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth() - i, 0);

        // Get clients created in this month
        const newClients = await this.prismaService.client.count({
          where: {
            invoices: {
              some: {
                dueDate: {
                  gte: monthStart,
                  lte: monthEnd
                }
              }
            }
          }
        });

        // Get clients who had invoices in previous month but not in current month (lost clients)
        const clientsWithPreviousInvoices = await this.prismaService.client.findMany({
          where: {
            invoices: {
              some: {
                dueDate: {
                  gte: previousMonthStart,
                  lte: previousMonthEnd
                }
              }
            }
          },
          select: { id: true }
        });

        const clientsWithCurrentInvoices = await this.prismaService.client.findMany({
          where: {
            invoices: {
              some: {
                dueDate: {
                  gte: monthStart,
                  lte: monthEnd
                }
              }
            }
          },
          select: { id: true }
        });

        const currentClientIds = new Set(clientsWithCurrentInvoices.map(c => c.id));
        const lostClients = clientsWithPreviousInvoices.filter(
          c => !currentClientIds.has(c.id)
        ).length;

        // Get revenue for the month
        const monthlyInvoices = await this.prismaService.invoice.findMany({
          where: {
            dueDate: {
              gte: monthStart,
              lte: monthEnd
            },
            paid: true
          }
        });

        const revenue = monthlyInvoices.reduce((sum, inv) => sum + inv.amount, 0);

        // Calculate payment ratio for the month
        const totalMonthlyInvoices = await this.prismaService.invoice.count({
          where: {
            dueDate: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        });

        const paymentRatio = totalMonthlyInvoices > 0 
          ? monthlyInvoices.length / totalMonthlyInvoices 
          : 0;

        trends.push({
          period: monthStart.toISOString().slice(0, 7), // YYYY-MM format
          newClients,
          lostClients,
          revenue,
          paymentRatio
        });
      }

      return trends.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Trend analytics error:', error);
      return [];
    }
  }

  async getTopClientsAtRisk(limit: number = 10): Promise<ClientAnalytics[]> {
    try {
      const clients = await this.prismaService.client.findMany({
        include: {
          invoices: true
        }
      });

      const clientAnalytics = await Promise.all(
        clients.map(client => this.getClientAnalytics(client.id))
      );

      const validAnalytics = clientAnalytics.filter(Boolean) as ClientAnalytics[];

      // Sort by risk factors: high overdue count, low payment ratio, recent inactivity
      return validAnalytics
        .sort((a, b) => {
          const aRiskScore = (a.overdueCount * 0.4) + 
                            ((1 - a.paymentRatio) * 0.3) + 
                            (Math.min(a.daysSinceLastInvoice, 365) / 365 * 0.3);
          const bRiskScore = (b.overdueCount * 0.4) + 
                            ((1 - b.paymentRatio) * 0.3) + 
                            (Math.min(b.daysSinceLastInvoice, 365) / 365 * 0.3);
          return bRiskScore - aRiskScore;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Top clients at risk error:', error);
      return [];
    }
  }

  async getPaymentPatterns(): Promise<PaymentPatterns> {
    try {
      const allInvoices = await this.prismaService.invoice.findMany();
      const now = new Date();
      
      let onTimePayments = 0;
      let latePayments = 0;
      let totalDaysLate = 0;

      allInvoices.forEach(invoice => {
        if (invoice.paid) {
          // Since we don't have payment date, we'll consider paid invoices as on-time
          onTimePayments++;
        } else if (new Date(invoice.dueDate) < now) {
          // Unpaid and overdue
          latePayments++;
          const daysLate = Math.floor(
            (now.getTime() - new Date(invoice.dueDate).getTime()) / (24 * 60 * 60 * 1000)
          );
          totalDaysLate += daysLate;
        }
      });

      const averageDaysLate = latePayments > 0 ? totalDaysLate / latePayments : 0;

      return {
        onTimePayments,
        latePayments,
        averageDaysLate,
        totalInvoices: allInvoices.length
      };
    } catch (error) {
      console.error('Payment patterns error:', error);
      return {
        onTimePayments: 0,
        latePayments: 0,
        averageDaysLate: 0,
        totalInvoices: 0
      };
    }
  }
}