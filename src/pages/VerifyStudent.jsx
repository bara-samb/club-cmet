import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, XCircle, CheckCircle2, AlertTriangle, User, Calendar, Award } from 'lucide-react';
import { api } from '../context/UserContext';
import logoUcak from '../assets/logo-ucak.png';

export default function VerifyStudent() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // APPEL RÉEL AU BACKEND
        const response = await api.get(`/api/v1/users/verify/${token}`);
        setData(response.data);
        setStatus('valid');
      } catch (e) {
        setStatus('invalid');
      }
    };
    if (token) verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] flex flex-col items-center justify-center p-6 font-sans">
      <div className="mb-8 text-center"><img src={logoUcak} alt="UCAK" className="w-16 h-16 mx-auto mb-4 grayscale" /><h1 className="text-xl font-black text-ucak-purple dark:text-white mt-1">Authentification Étudiant</h1></div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white dark:bg-[#151b2b] rounded-[2rem] shadow-2xl overflow-hidden">
        {status === 'loading' && <div className="p-12 text-center"><ShieldCheck className="mx-auto text-ucak-purple animate-pulse mb-4" size={48} /><h2 className="font-bold">Analyse en cours...</h2></div>}
        
        {status === 'valid' && data && (
          <div>
             <div className="bg-green-500 text-white p-6 text-center"><CheckCircle2 size={48} className="mx-auto mb-2" /><h2 className="text-2xl font-black uppercase">Carte Valide</h2></div>
             <div className="p-8 space-y-4">
                <div className="flex items-center gap-4"><div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-black">{data.full_name?.charAt(0)}</div><div><p className="text-xs text-gray-400 font-bold uppercase">Étudiant</p><h3 className="text-xl font-black">{data.full_name}</h3></div></div>
                <div className="grid grid-cols-2 gap-4"><div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-400 font-bold">Matricule</p><p className="font-mono font-bold">{data.matricule}</p></div><div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-400 font-bold">Statut</p><span className="text-green-600 font-bold text-xs uppercase">INSCRIT</span></div></div>
             </div>
          </div>
        )}

        {status === 'invalid' && <div className="p-8 text-center"><XCircle size={48} className="mx-auto text-red-500 mb-4" /><h2 className="text-xl font-black uppercase">Document Invalide</h2><p className="text-gray-500 mt-2">QR Code non reconnu par la base UCAK.</p></div>}
      </motion.div>
      <div className="mt-8 text-center"><Link to="/" className="text-xs font-bold text-ucak-purple hover:underline">Retour à l'accueil</Link></div>
    </div>
  );
}