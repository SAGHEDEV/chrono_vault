import React from 'react';
import { Loader2, Lock, Upload, CheckCircle2, FileCheck, Shield } from 'lucide-react';

interface ProgressModalProps {
    open: boolean;
    progress: {
        currentFile: number;
        totalFiles: number;
        stage: 'encrypting' | 'uploading' | 'creating_vault' | 'complete';
        message: string;
        percentage: number;
    } | null;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ open, progress }) => {
    if (!open || !progress) return null;

    const getStageConfig = (stage: string) => {
        switch (stage) {
            case 'encrypting':
                return {
                    icon: Shield,
                    color: 'text-[#1A73E8]',
                    bgColor: 'bg-[#1A73E8]',
                    borderColor: 'border-black',
                    progressColor: 'bg-[#1A73E8]',
                    shadowColor: 'shadow-[12px_12px_0px_0px_rgba(26,115,232,1)]',
                };
            case 'uploading':
                return {
                    icon: Upload,
                    color: 'text-[#4FC3F7]',
                    bgColor: 'bg-[#4FC3F7]',
                    borderColor: 'border-black',
                    progressColor: 'bg-[#4FC3F7]',
                    shadowColor: 'shadow-[12px_12px_0px_0px_rgba(79,195,247,1)]',
                };
            case 'creating_vault':
                return {
                    icon: Lock,
                    color: 'text-[#0B2A4A]',
                    bgColor: 'bg-[#0B2A4A]',
                    borderColor: 'border-black',
                    progressColor: 'bg-[#0B2A4A]',
                    shadowColor: 'shadow-[12px_12px_0px_0px_rgba(11,42,74,1)]',
                };
            case 'complete':
                return {
                    icon: CheckCircle2,
                    color: 'text-[#1A73E8]',
                    bgColor: 'bg-[#1A73E8]',
                    borderColor: 'border-black',
                    progressColor: 'bg-[#1A73E8]',
                    shadowColor: 'shadow-[12px_12px_0px_0px_rgba(26,115,232,1)]',
                };
            default:
                return {
                    icon: Loader2,
                    color: 'text-[#1A73E8]',
                    bgColor: 'bg-[#1A73E8]',
                    borderColor: 'border-black',
                    progressColor: 'bg-[#1A73E8]',
                    shadowColor: 'shadow-[12px_12px_0px_0px_rgba(26,115,232,1)]',
                };
        }
    };

    const config = getStageConfig(progress.stage);
    const Icon = config.icon;
    const isComplete = progress.stage === 'complete';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className={`w-full max-w-md mx-4 bg-white border-4 border-black ${config.shadowColor} overflow-hidden`}>
                {/* Header with Icon */}
                <div className={`${config.bgColor} ${config.borderColor} border-b-4 px-6 py-8 text-center`}>
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-white border-4 border-black mb-4 shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]`}>
                        {isComplete ? (
                            <Icon className={`w-8 h-8 ${config.color}`} />
                        ) : (
                            <Icon className={`w-8 h-8 ${config.color} animate-spin`} />
                        )}
                    </div>

                    <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">
                        {isComplete ? 'Vault Created!' : 'Creating Vault'}
                    </h3>

                    <p className={`text-sm font-bold uppercase tracking-wide text-white`}>
                        {progress.message}
                    </p>
                </div>

                {/* Progress Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* File Counter */}
                    {!isComplete && (
                        <div className="flex items-center justify-between text-sm border-4 border-black bg-[#E3F2FD] p-3 shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                            <div className="flex items-center gap-2">
                                <FileCheck className="w-4 h-4 text-[#0B2A4A]" />
                                <span className="font-black text-[#0B2A4A] uppercase text-xs tracking-wide">Processing Files</span>
                            </div>
                            <span className="text-[#1A73E8] font-black text-lg">
                                {progress.currentFile} / {progress.totalFiles}
                            </span>
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-black uppercase tracking-wide font-black text-xs">
                                {progress.stage.replace('_', ' ')}
                            </span>
                            <span className={`font-black text-2xl ${config.color}`}>
                                {Math.round(progress.percentage)}%
                            </span>
                        </div>

                        <div className="relative h-8 bg-white border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                            <div
                                className={`absolute inset-y-0 left-0 ${config.progressColor} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                                style={{ width: `${progress.percentage}%` }}
                            >
                                <span className="text-xs font-black text-white">▶</span>
                            </div>
                        </div>
                    </div>

                    {/* Stage Indicators */}
                    <div className="grid grid-cols-4 gap-3">
                        {['encrypting', 'uploading', 'creating_vault', 'complete'].map((stage, idx) => {
                            const stageNames = ['Encrypt', 'Upload', 'Create', 'Done'];
                            const stageColors = ['bg-[#1A73E8]', 'bg-[#4FC3F7]', 'bg-[#0B2A4A]', 'bg-[#1A73E8]'];
                            const isActive = progress.stage === stage;
                            const isPast = ['encrypting', 'uploading', 'creating_vault', 'complete'].indexOf(progress.stage) > idx;

                            return (
                                <div key={stage} className="flex flex-col items-center gap-2">
                                    <div
                                        className={`w-10 h-10 border-4 border-black flex items-center justify-center text-xs font-black transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] ${isPast || isActive
                                            ? `${stageColors[idx]} text-white`
                                            : 'bg-white text-black'
                                            }`}
                                    >
                                        {isPast && !isActive ? (
                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                        ) : (
                                            idx + 1
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase ${isActive ? 'text-black' : 'text-gray-400'}`}>
                                        {stageNames[idx]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Fun facts or tips while waiting */}
                    {!isComplete && (
                        <div className={`bg-[#E3F2FD] border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]`}>
                            <p className="text-xs text-[#0B2A4A] leading-relaxed font-bold">
                                💡 <span className="font-black uppercase">Did you know?</span> Your files are being encrypted with threshold encryption,
                                meaning multiple key servers must approve access before decryption is possible.
                            </p>
                        </div>
                    )}

                    {/* Complete State Info */}
                    {isComplete && (
                        <div className="space-y-3">
                            <div className="bg-[#E3F2FD] border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-[#0B2A4A] mb-2 uppercase tracking-wide">
                                            Your vault has been created securely!
                                        </p>
                                        <p className="text-xs text-[#0B2A4A] leading-relaxed font-bold">
                                            All files have been encrypted and stored on Walrus. You can now access your vault from the dashboard.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
        </div>
    );
};

export default ProgressModal;