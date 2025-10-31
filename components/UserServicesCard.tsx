import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../types';
import { Server, Globe, ShieldCheck, Bot, Smartphone, Package } from 'lucide-react';
import Button from './ui/Button';

interface UserServicesCardProps {
    service: UserService;
}

const getServiceIcon = (planName: string) => {
    const lowerCaseName = planName.toLowerCase();
    if (lowerCaseName.includes('hosting')) return <Server className="w-7 h-7" />;
    if (lowerCaseName.includes('domain')) return <Globe className="w-7 h-7" />;
    if (lowerCaseName.includes('security')) return <ShieldCheck className="w-7 h-7" />;
    if (lowerCaseName.includes('ai')) return <Bot className="w-7 h-7" />;
    if (lowerCaseName.includes('app')) return <Smartphone className="w-7 h-7" />;
    return <Package className="w-7 h-7" />;
};

const getStatusInfo = (renewalDateStr: string, status: string) => {
    if (status !== 'active') {
      return { text: 'Inactive', color: 'bg-gray-500', dotColor: 'bg-gray-400', textColor: 'text-gray-500', isActionable: false };
    }
  
    const renewalDate = new Date(renewalDateStr);
    const now = new Date();
    const diffTime = renewalDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays < 0) {
      return { text: 'Expired', color: 'bg-red-500', dotColor: 'bg-red-500', textColor: 'text-red-600', isActionable: true };
    }
    if (diffDays <= 30) {
      return { text: 'Expiring Soon', color: 'bg-yellow-500', dotColor: 'bg-yellow-400', textColor: 'text-yellow-600', isActionable: true };
    }
    return { text: 'Active', color: 'bg-green-500', dotColor: 'bg-green-500', textColor: 'text-green-600', isActionable: false };
};


const UserServicesCard: React.FC<UserServicesCardProps> = ({ service }) => {
    const navigate = useNavigate();
    const icon = getServiceIcon(service.planName);
    const statusInfo = getStatusInfo(service.renewalDate, service.status);
    
    const handleRenew = () => {
        // This would ideally trigger a checkout flow for this specific item
        console.log("Renewing service:", service._id);
    }
    
    const handleManage = () => {
        navigate(`/user/service/${service._id}`);
    }

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200/80 hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
                        {icon}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                        <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`}></span>
                        {statusInfo.text}
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="font-bold text-gray-800">{service.planName}</h3>
                    {service.domainName && (
                         <p className="text-sm text-blue-600 font-mono">{service.domainName}</p>
                    )}
                </div>
            </div>

            <div className="mt-4">
                 <div className="text-sm">
                    <p className="font-semibold text-gray-500">
                        Renews on: {new Date(service.renewalDate).toLocaleDateString()}
                    </p>
                    <p className={`font-bold ${statusInfo.textColor}`}>
                         {statusInfo.text === 'Expired' ? `Expired ${Math.abs(Math.ceil((new Date(service.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days ago` : ` `}
                    </p>
                </div>
                <div className="border-t my-4"></div>
                <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-gray-800">₹{service.price}</p>
                    <div className="flex gap-2">
                        {statusInfo.isActionable && (
                            <Button onClick={handleRenew} className="!text-sm !py-1.5 !px-3">Renew Now</Button>
                        )}
                        <Button onClick={handleManage} variant="secondary" className="!text-sm !py-1.5 !px-3">Manage</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserServicesCard;