import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { BookOpen, Plus, X, Search, Pin, Trash2, FileText, Image as ImageIcon, Upload, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject: '',
    pinned: false,
    attachments: []
  });

  const subjects = ['All', ...new Set(notes.map(note => note.subject).filter(Boolean))];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.subject) {
      alert('Please enter title and subject');
      return;
    }

    const newNote = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addNote(newNote);
    setFormData({
      title: '',
      content: '',
      subject: '',
      pinned: false,
      attachments: []
    });
    setShowForm(false);
  };

  const togglePin = (id) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateNote({ ...note, pinned: !note.pinned });
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file) // In production, upload to server/cloud
    }));
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...newAttachments]
    });
  };

  const removeAttachment = (index) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index)
    });
  };

  const filteredNotes = notes
    .filter(note => selectedSubject === 'All' || note.subject === selectedSubject)
    .filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const pinnedNotes = filteredNotes.filter(note => note.pinned);
  const regularNotes = filteredNotes.filter(note => !note.pinned);

  const subjectColors = {
    'Mathematics': 'from-blue-500 to-indigo-600',
    'Physics': 'from-purple-500 to-pink-600',
    'Chemistry': 'from-green-500 to-teal-600',
    'Biology': 'from-emerald-500 to-green-600',
    'Computer Science': 'from-cyan-500 to-blue-600',
    'English': 'from-orange-500 to-red-600',
    'History': 'from-amber-500 to-orange-600',
    'Economics': 'from-yellow-500 to-orange-500',
    'default': 'from-gray-500 to-slate-600'
  };

  const getSubjectColor = (subject) => {
    return subjectColors[subject] || subjectColors['default'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Notes</h1>
              <p className="text-sm text-blue-100">Organize your study notes</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {showForm ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Add Note Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create Note</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Chapter 5: Calculus"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mathematics"
                  list="subjects"
                />
                <datalist id="subjects">
                  <option value="Mathematics" />
                  <option value="Physics" />
                  <option value="Chemistry" />
                  <option value="Biology" />
                  <option value="Computer Science" />
                  <option value="English" />
                  <option value="History" />
                  <option value="Economics" />
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write your notes here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">Upload PDFs or Images</span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                        {attachment.type.startsWith('image/') ? (
                          <ImageIcon className="w-5 h-5 text-blue-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-red-500" />
                        )}
                        <span className="flex-1 text-sm text-gray-700 truncate">{attachment.name}</span>
                        <span className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)}KB</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="pinned" className="text-sm text-gray-700">
                  Pin this note for quick access
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Create Note
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

        {/* Search Bar */}
        {notes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {subjects.map(subject => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedSubject === subject
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Pin className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-800">Pinned Notes</h2>
            </div>
            {pinnedNotes.map((note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                togglePin={togglePin} 
                deleteNote={deleteNote}
                getSubjectColor={getSubjectColor}
              />
            ))}
          </div>
        )}

        {/* Regular Notes */}
        {regularNotes.length > 0 && (
          <div className="space-y-3">
            {pinnedNotes.length > 0 && (
              <h2 className="text-lg font-bold text-gray-800">All Notes</h2>
            )}
            {regularNotes.map((note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                togglePin={togglePin} 
                deleteNote={deleteNote}
                getSubjectColor={getSubjectColor}
              />
            ))}
          </div>
        )}

        {filteredNotes.length === 0 && notes.length > 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notes found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filter</p>
          </div>
        )}

        {notes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notes yet</p>
            <p className="text-gray-400 text-sm">Create your first study note!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NoteCard({ note, togglePin, deleteNote, getSubjectColor }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${getSubjectColor(note.subject)} p-4`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">{note.title}</h3>
            <p className="text-sm text-white/90">{note.subject}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => togglePin(note.id)}
              className="text-white hover:scale-110 transition-transform"
            >
              {note.pinned ? (
                <Star className="w-5 h-5 fill-white" />
              ) : (
                <Pin className="w-5 h-5" />
              )}
            </button>
            <button
                onClick={() => deleteNote(note._id || note.id)}
              className="text-white hover:scale-110 transition-transform"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {note.content && (
          <div className="mb-3">
            <p className={`text-gray-700 whitespace-pre-wrap ${!expanded && 'line-clamp-3'}`}>
              {note.content}
            </p>
            {note.content.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 text-sm font-medium mt-2 hover:underline"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {note.attachments && note.attachments.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Attachments ({note.attachments.length})</p>
            <div className="grid grid-cols-2 gap-2">
              {note.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {attachment.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className="text-xs text-gray-600 truncate">{attachment.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created {format(new Date(note.createdAt), 'PP')}</span>
          {note.updatedAt !== note.createdAt && (
            <span>Updated {format(new Date(note.updatedAt), 'PP')}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
