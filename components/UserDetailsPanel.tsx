import React from 'react';
import { Edit, Link, Smile, User as UserIcon } from 'lucide-react';

interface UserDetailsPanelProps {
    user: { name: string, phone?: string };
}

const AttributeItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-black">{value}</span>
    </div>
);

const UserDetailsPanel: React.FC<UserDetailsPanelProps> = ({ user }) => {
    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-black">{user.name}</h3>
                        </div>
                    </div>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><Edit size={18} /></button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Attributes */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase">Attributes</h4>
                    <AttributeItem label="Channel" value="Web" />
                    <AttributeItem label="ID" value="N/A" />
                    <AttributeItem label="Phone number" value={user.phone || 'N/A'} />
                    <AttributeItem label="Address" value="N/A" />
                </div>

                {/* Notes */}
                <div className="mt-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Notes</h4>
                    <div className="border border-gray-200 rounded-lg">
                        <textarea 
                            placeholder="Write a note..."
                            rows={4}
                            className="w-full p-2 text-sm focus:outline-none rounded-t-lg resize-none"
                        />
                        <div className="p-2 border-t bg-gray-50 flex justify-end gap-2">
                             <button className="text-gray-500 hover:text-black"><Link size={16} /></button>
                             <button className="text-gray-500 hover:text-black"><Smile size={16} /></button>
                        </div>
                    </div>
                </div>

                 {/* Note History */}
                <div className="mt-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">History</h4>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                AD
                            </div>
                            <div>
                                <p className="text-sm text-black">
                                    <span className="font-bold">Admin</span> added a note
                                </p>
                                <p className="text-xs text-gray-400">Feb 23, 18:43</p>
                                <p className="mt-1 text-sm p-2 bg-gray-100 rounded-md">Send Sarah an update by email by 4 PM tomorrow.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsPanel;
