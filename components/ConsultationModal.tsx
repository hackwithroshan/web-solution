import React from 'react';
import { requestConsultation } from '../services/api';
import { useToast } from '../hooks/useToast';
import Input from './ui/Input';
import Button from './ui/Button';
import { Loader, X, Send } from 'lucide-react';

interface ConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = React.useState({ name: '', email: '', phone: '', message: '' });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { addToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await requestConsultation(formData);
            addToast('Consultation request sent successfully!', 'success');
            setFormData({ name: '', email: '', phone: '', message: '' }); // Clear form
            onClose(); // Close modal
        } catch (error: any) {
            addToast(error.message || 'Failed to send request.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="consultation-modal-title"
        >
            <div 
                className="bg-white text-gray-800 rounded-lg shadow-xl w-full max-w-lg relative animate-slide-in-up"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    aria-label="Close modal"
                >
                    <X size={24} />
                </button>
                <div className="p-8">
                    <h2 id="consultation-modal-title" className="text-2xl font-bold mb-2">Book a Free Consultation</h2>
                    <p className="text-sm text-gray-600 mb-6">Tell us about your project, and we'll get back to you shortly.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} variant="light" required />
                        <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} variant="light" required />
                        <Input label="Mobile Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} variant="light" required />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                            <textarea 
                                name="message" 
                                value={formData.message} 
                                onChange={handleChange} 
                                required 
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder="Describe your project or question..."
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                             <Button type="submit" disabled={isSubmitting} className="flex items-center">
                                {isSubmitting ? <Loader className="animate-spin h-5 w-5 mr-2" /> : <Send size={16} className="mr-2"/>}
                                {isSubmitting ? 'Sending...' : 'Send Request'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Add some simple animations
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
  `;
  document.head.appendChild(style);
}

export default ConsultationModal;