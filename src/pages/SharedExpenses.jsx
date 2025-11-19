import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Users, Plus, X, DollarSign, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function SharedExpenses() {
  const { sharedExpenses, addSharedExpense, updateSharedExpense, deleteSharedExpense } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    totalAmount: '',
    paidBy: '',
    splitWith: [],
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    settled: false
  });
  const [newPerson, setNewPerson] = useState('');

  const categories = ['Food', 'Rent', 'Utilities', 'WiFi', 'Electricity', 'Shopping', 'Entertainment', 'Other'];

  const handleAddPerson = () => {
    if (newPerson.trim() && !formData.splitWith.some(p => p.name === newPerson.trim())) {
      setFormData({
        ...formData,
        splitWith: [...formData.splitWith, { name: newPerson.trim(), share: 'equal', customAmount: 0 }]
      });
      setNewPerson('');
    }
  };

  const handleRemovePerson = (name) => {
    setFormData({
      ...formData,
      splitWith: formData.splitWith.filter(p => p.name !== name)
    });
  };

  const handleUpdateShare = (name, shareType, customAmount) => {
    setFormData({
      ...formData,
      splitWith: formData.splitWith.map(p =>
        p.name === name ? { ...p, share: shareType, customAmount: customAmount || 0 } : p
      )
    });
  };

  const calculateShares = () => {
    const total = parseFloat(formData.totalAmount) || 0;
    const equalPeople = formData.splitWith.filter(p => p.share === 'equal');
    const customPeople = formData.splitWith.filter(p => p.share === 'custom');
    
    const customTotal = customPeople.reduce((sum, p) => sum + (parseFloat(p.customAmount) || 0), 0);
    const equalShare = equalPeople.length > 0 ? (total - customTotal) / equalPeople.length : 0;
    
    return formData.splitWith.map(p => ({
      name: p.name,
      amount: p.share === 'equal' ? equalShare : parseFloat(p.customAmount) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.totalAmount || !formData.paidBy || formData.splitWith.length === 0) {
      alert('Please fill all required fields and add at least one person to split with');
      return;
    }

    const shares = calculateShares();
    const newExpense = {
      id: Date.now(),
      ...formData,
      totalAmount: parseFloat(formData.totalAmount),
      shares,
      createdAt: new Date().toISOString()
    };

    addSharedExpense(newExpense);
    setFormData({
      description: '',
      totalAmount: '',
      paidBy: '',
      splitWith: [],
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      settled: false
    });
    setShowForm(false);
  };

  const toggleSettle = (id) => {
    const expense = sharedExpenses.find(e => e.id === id);
    if (expense) {
      updateSharedExpense({ ...expense, settled: !expense.settled });
    }
  };

  const getBalance = () => {
    const balances = {};
    
    sharedExpenses.forEach(expense => {
      if (expense.settled) return;
      
      // Person who paid
      if (!balances[expense.paidBy]) balances[expense.paidBy] = 0;
      balances[expense.paidBy] += expense.totalAmount;
      
      // People who owe
      expense.shares.forEach(share => {
        if (!balances[share.name]) balances[share.name] = 0;
        balances[share.name] -= share.amount;
      });
    });
    
    return balances;
  };

  const getSettlements = () => {
    const balances = getBalance();
    const settlements = [];
    
    const creditors = Object.entries(balances).filter(([_, amount]) => amount > 0).sort((a, b) => b[1] - a[1]);
    const debtors = Object.entries(balances).filter(([_, amount]) => amount < 0).sort((a, b) => a[1] - b[1]);
    
    let i = 0, j = 0;
    const creditorsCopy = creditors.map(([name, amount]) => ({ name, amount }));
    const debtorsCopy = debtors.map(([name, amount]) => ({ name, amount: -amount }));
    
    while (i < creditorsCopy.length && j < debtorsCopy.length) {
      const minAmount = Math.min(creditorsCopy[i].amount, debtorsCopy[j].amount);
      settlements.push({
        from: debtorsCopy[j].name,
        to: creditorsCopy[i].name,
        amount: minAmount
      });
      
      creditorsCopy[i].amount -= minAmount;
      debtorsCopy[j].amount -= minAmount;
      
      if (creditorsCopy[i].amount === 0) i++;
      if (debtorsCopy[j].amount === 0) j++;
    }
    
    return settlements;
  };

  const exportSummary = () => {
    const balances = getBalance();
    const settlements = getSettlements();
    
    let summary = 'SHARED EXPENSES SETTLEMENT SUMMARY\n';
    summary += '=====================================\n\n';
    summary += `Generated on: ${format(new Date(), 'PPpp')}\n\n`;
    
    summary += 'BALANCES:\n';
    Object.entries(balances).forEach(([person, amount]) => {
      summary += `${person}: ${amount >= 0 ? '+' : ''}₹${amount.toFixed(2)}\n`;
    });
    
    summary += '\nSETTLEMENTS NEEDED:\n';
    settlements.forEach(s => {
      summary += `${s.from} → ${s.to}: ₹${s.amount.toFixed(2)}\n`;
    });
    
    summary += '\nEXPENSE DETAILS:\n';
    sharedExpenses.filter(e => !e.settled).forEach(expense => {
      summary += `\n${expense.description} (${expense.category})\n`;
      summary += `Date: ${format(new Date(expense.date), 'PP')}\n`;
      summary += `Total: ₹${expense.totalAmount} (Paid by ${expense.paidBy})\n`;
      summary += 'Split:\n';
      expense.shares.forEach(share => {
        summary += `  - ${share.name}: ₹${share.amount.toFixed(2)}\n`;
      });
    });
    
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settlement-summary-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
  };

  const balances = getBalance();
  const settlements = getSettlements();
  const activeExpenses = sharedExpenses.filter(e => !e.settled);
  const settledExpenses = sharedExpenses.filter(e => e.settled);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Shared Expenses</h1>
              <p className="text-sm text-purple-100">Split bills with friends</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-purple-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {showForm ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Add Expense Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Shared Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Dinner at restaurant"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paid By *</label>
                  <input
                    type="text"
                    value={formData.paidBy}
                    onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Split With *</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newPerson}
                    onChange={(e) => setNewPerson(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPerson())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Add person name"
                  />
                  <button
                    type="button"
                    onClick={handleAddPerson}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {formData.splitWith.length > 0 && (
                  <div className="space-y-2">
                    {formData.splitWith.map((person) => (
                      <div key={person.name} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                        <span className="flex-1 font-medium">{person.name}</span>
                        <select
                          value={person.share}
                          onChange={(e) => handleUpdateShare(person.name, e.target.value, person.customAmount)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="equal">Equal</option>
                          <option value="custom">Custom</option>
                        </select>
                        {person.share === 'custom' && (
                          <input
                            type="number"
                            step="0.01"
                            value={person.customAmount}
                            onChange={(e) => handleUpdateShare(person.name, 'custom', e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Amount"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePerson(person.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formData.splitWith.length > 0 && formData.totalAmount && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Split Preview:</p>
                  {calculateShares().map((share) => (
                    <p key={share.name} className="text-sm text-gray-600">
                      {share.name}: ₹{share.amount.toFixed(2)}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Settlement Summary */}
        {settlements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Settlement Summary</h2>
              <button
                onClick={exportSummary}
                className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <div className="space-y-3">
              {settlements.map((settlement, index) => (
                <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <p className="font-medium">
                    {settlement.from} → {settlement.to}
                  </p>
                  <p className="text-2xl font-bold">₹{settlement.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Balances */}
        {Object.keys(balances).length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Current Balances</h2>
            <div className="space-y-2">
              {Object.entries(balances).map(([person, amount]) => (
                <div key={person} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{person}</span>
                  <span className={`text-lg font-bold ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {amount >= 0 ? '+' : ''}₹{amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Expenses */}
        {activeExpenses.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800">Active Expenses</h2>
            {activeExpenses.map((expense) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{expense.description}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(expense.date), 'PP')} • {expense.category}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSharedExpense(expense.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 mb-3">
                  <p className="text-2xl font-bold text-purple-600">₹{expense.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Paid by {expense.paidBy}</p>
                </div>

                <div className="space-y-1 mb-3">
                  <p className="text-sm font-medium text-gray-700">Split:</p>
                  {expense.shares.map((share) => (
                    <div key={share.name} className="flex justify-between text-sm text-gray-600">
                      <span>{share.name}</span>
                      <span className="font-medium">₹{share.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => toggleSettle(expense.id)}
                  className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Settled
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Settled Expenses */}
        {settledExpenses.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800">Settled Expenses</h2>
            {settledExpenses.map((expense) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 rounded-2xl shadow-md p-4 opacity-60"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{expense.description}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(expense.date), 'PP')} • ₹{expense.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {sharedExpenses.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No shared expenses yet</p>
            <p className="text-gray-400 text-sm">Start splitting bills with friends!</p>
          </div>
        )}
      </div>
    </div>
  );
}
