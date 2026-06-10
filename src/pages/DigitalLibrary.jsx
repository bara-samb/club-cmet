import { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, BookOpen, FileText, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DigitalLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);

  // Données de bibliothèque d'exemple
  const books = [
    {
      id: 1,
      title: 'Introduction à la Programmation Web',
      author: 'Dr. Abdoul Kader',
      category: 'informatique',
      level: 'débutant',
      cover: '📘',
      format: 'PDF',
      size: '2.5 MB',
      downloads: 234,
      rating: 4.8,
      description: 'Un guide complet pour débuter en développement web avec HTML, CSS et JavaScript.'
    },
    {
      id: 2,
      title: 'Principes de Gestion Financière Moderne',
      author: 'Prof. Aïssatou Sow',
      category: 'hec',
      level: 'intermédiaire',
      cover: '📗',
      format: 'PDF',
      size: '3.1 MB',
      downloads: 156,
      rating: 4.6,
      description: 'Exploitation des stratégies financières pour les entreprises contemporaines.'
    },
    {
      id: 3,
      title: 'React et les Meilleures Pratiques',
      author: 'Eng. Moustapha Diallo',
      category: 'informatique',
      level: 'avancé',
      cover: '⚛️',
      format: 'ePub',
      size: '1.8 MB',
      downloads: 412,
      rating: 4.9,
      description: 'Maîtrisez React avec les patterns modernes et les hooks.'
    },
    {
      id: 4,
      title: 'Marketing Digital et Réseaux Sociaux',
      author: 'Mme Fatou Ndiaye',
      category: 'hec',
      level: 'débutant',
      cover: '📱',
      format: 'PDF',
      size: '2.2 MB',
      downloads: 189,
      rating: 4.5,
      description: 'Stratégies modernes pour se connecter à votre audience en ligne.'
    },
    {
      id: 5,
      title: 'Base de Données et SQL Avancé',
      author: 'Dr. Mamadou Ba',
      category: 'informatique',
      level: 'avancé',
      cover: '🗄️',
      format: 'PDF',
      size: '2.9 MB',
      downloads: 298,
      rating: 4.7,
      description: 'Conception et optimisation de bases de données relationnelles.'
    },
    {
      id: 6,
      title: 'Entrepreneuriat et Création d\'Entreprise',
      author: 'Prof. Alassane Cissé',
      category: 'hec',
      level: 'intermédiaire',
      cover: '🚀',
      format: 'ePub',
      size: '1.5 MB',
      downloads: 267,
      rating: 4.8,
      description: 'Tout ce qu\'il faut savoir pour lancer et développer une startup.'
    },
  ];

  const categories = [
    { id: 'all', label: 'Tous les documents', count: books.length },
    { id: 'informatique', label: 'Informatique', count: books.filter(b => b.category === 'informatique').length },
    { id: 'hec', label: 'Gestion & Économie', count: books.filter(b => b.category === 'hec').length },
  ];

  const levels = [
    { id: 'all', label: 'Tous les niveaux' },
    { id: 'débutant', label: 'Débutant' },
    { id: 'intermédiaire', label: 'Intermédiaire' },
    { id: 'avancé', label: 'Avancé' },
  ];

  // Filtrage intelligent
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || book.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [searchQuery, selectedCategory, selectedLevel]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-ucak-dark dark:via-ucak-dark-card dark:to-ucak-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-ucak-purple via-ucak-cyan to-ucak-lime py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-10 h-10 text-white" />
              <h1 className="text-4xl font-black text-white">Bibliothèque Numérique</h1>
            </div>
            <p className="text-lg text-white/90">Accédez à nos ressources éducatives en ligne</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Barre de recherche et filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par titre, auteur ou description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-ucak-dark-card text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-ucak-purple focus:outline-none transition-colors"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ucak-purple text-white font-semibold hover:bg-ucak-cyan transition-all"
            >
              <Filter className="w-5 h-5" />
              <span>Filtres</span>
            </button>
          </div>

          {/* Filtres déroulants */}
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-white dark:bg-ucak-dark-card rounded-xl border border-gray-200 dark:border-gray-700"
            >
              {/* Catégories */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Catégories</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat.id}
                        checked={selectedCategory === cat.id}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4 accent-ucak-purple"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{cat.label} ({cat.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Niveaux */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Niveau d'étude</h3>
                <div className="space-y-2">
                  {levels.map(level => (
                    <label key={level.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="level"
                        value={level.id}
                        checked={selectedLevel === level.id}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-4 h-4 accent-ucak-cyan"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Résultats */}
        <div className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">
          {filteredBooks.length} document{filteredBooks.length > 1 ? 's' : ''} trouvé{filteredBooks.length > 1 ? 's' : ''}
        </div>

        {/* Grille de documents */}
        {filteredBooks.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredBooks.map(book => (
              <motion.div
                key={book.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-white dark:bg-ucak-dark-card rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100 dark:border-gray-800 group"
              >
                {/* Cover */}
                <div className="relative h-48 bg-gradient-to-br from-ucak-purple/20 to-ucak-cyan/20 dark:from-ucak-purple/10 dark:to-ucak-cyan/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <span className="text-7xl">{book.cover}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <div className="text-white">
                      <div className="text-xs font-semibold opacity-75">{book.format}</div>
                      <div className="text-xs opacity-75">{book.size}</div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-lg">{book.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Par {book.author}</p>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{book.description}</p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs mb-4">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-ucak-purple/10 text-ucak-purple dark:text-ucak-cyan rounded-full font-semibold">
                        {book.category === 'informatique' ? '💻 Info' : '📊 Gestion'}
                      </span>
                      <span className="px-2 py-1 bg-ucak-cyan/10 text-ucak-cyan rounded-full font-semibold">
                        {book.level.charAt(0).toUpperCase() + book.level.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      <span>⭐ {book.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {book.downloads}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-ucak-purple text-white font-semibold rounded-lg hover:bg-ucak-cyan transition-colors">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Télécharger</span>
                      <span className="sm:hidden">DL</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Aperçu</span>
                      <span className="sm:hidden">👁️</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Loader className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">Aucun document ne correspond à votre recherche</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Essayez d'ajuster vos filtres</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
