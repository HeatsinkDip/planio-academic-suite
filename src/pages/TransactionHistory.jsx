import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, startOfDay, endOfDay, isWithinInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';

const TransactionHistory = () => {
    const { transactions, deleteTransaction } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, income, expense
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Quick date filters
    const setQuickDate = (range) => {
        const now = new Date();
        switch (range) {
            case 'today':
                setDateRange({
                    start: format(now, 'yyyy-MM-dd'),
                    end: format(now, 'yyyy-MM-dd')
                });
                break;
            case 'thisMonth':
                setDateRange({
                    start: format(startOfMonth(now), 'yyyy-MM-dd'),
                    end: format(endOfMonth(now), 'yyyy-MM-dd')
                });
                break;
            case 'all':
                setDateRange({ start: '', end: '' });
                break;
        }
    };

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            // Search filter
            if (searchTerm && !transaction.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Type filter
            if (filterType !== 'all' && transaction.type !== filterType) return false;

            // Date range filter
            if (dateRange.start && dateRange.end && transaction.date) {
                try {
                    const txDate = new Date(transaction.date);
                    const start = startOfDay(parseISO(dateRange.start));
                    const end = endOfDay(parseISO(dateRange.end));
                    if (!isWithinInterval(txDate, { start, end })) return false;
                } catch (e) {
                    // If date parsing fails, skip this filter
                }
            }

            return true;
        });
    }, [transactions, searchTerm, filterType, dateRange]);

    // Statistics
    const stats = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            total: filteredTransactions.length,
            income,
            expense,
            balance: income - expense,
        };
    }, [filteredTransactions]);

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Date', 'Description', 'Type', 'Amount'];
        const rows = filteredTransactions.map(t => [
            format(new Date(t.date), 'yyyy-MM-dd HH:mm'),
            t.title,
            t.type,
            t.amount.toFixed(2)
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 pt-12"
        >
            <header className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Transaction History</h1>
                        <p className="text-slate-500">View and export all transactions</p>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                        <Download size={18} />
                        <span className="text-sm">Export CSV</span>
                    </button>
                </div>
            </header>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-2xl text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={20} />
                        <span className="text-sm opacity-90">Income</span>
                    </div>
                    <div className="text-3xl font-bold">${stats.income.toFixed(2)}</div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-5 rounded-2xl text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown size={20} />
                        <span className="text-sm opacity-90">Expense</span>
                    </div>
                    <div className="text-3xl font-bold">${stats.expense.toFixed(2)}</div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={18} className="text-slate-600" />
                    <span className="font-medium text-slate-800">Filters</span>
                </div>

                <div className="space-y-3">
                    {/* Type Filter */}
                    <div>
                        <label className="text-xs text-slate-600 mb-2 block">Type</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'all', label: 'All' },
                                { value: 'income', label: 'Income' },
                                { value: 'expense', label: 'Expense' }
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setFilterType(type.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === type.value
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Date Filters */}
                    <div>
                        <label className="text-xs text-slate-600 mb-2 block">Quick Date</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'all', label: 'All Time' },
                                { value: 'today', label: 'Today' },
                                { value: 'thisMonth', label: 'This Month' }
                            ].map((quick) => (
                                <button
                                    key={quick.value}
                                    onClick={() => setQuickDate(quick.value)}
                                    className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    {quick.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Date Range */}
                    <div>
                        <label className="text-xs text-slate-600 mb-2 block">Custom Range</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                            />
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800">
                        {filteredTransactions.length} {filteredTransactions.length === 1 ? 'Transaction' : 'Transactions'}
                    </h3>
                    {searchTerm || filterType !== 'all' || dateRange.start ? (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterType('all');
                                setDateRange({ start: '', end: '' });
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                            Clear Filters
                        </button>
                    ) : null}
                </div>

                <div className="space-y-3">
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <Calendar size={48} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-lg">No transactions found</p>
                            <p className="text-sm mt-2">Try adjusting your filters</p>
                        </div>
                    ) : (
                        filteredTransactions.map((t) => (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`p-2.5 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 truncate">{t.title}</p>
                                        <p className="text-xs text-slate-500">{format(new Date(t.date), 'MMM d, yyyy - h:mm a')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-slate-800'
                                        }`}>
                                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => deleteTransaction(t.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default TransactionHistory;
