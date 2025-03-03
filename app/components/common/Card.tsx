import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-gray-800 border border-gray-700 rounded-lg shadow p-4 ${className}`}>
            {children}
        </div>
    );
};

export default Card;

export const CardHeader: React.FC<{ children: ReactNode; className?: string }> = ({
                                                                                      children,
                                                                                      className = ''
                                                                                  }) => {
    return (
        <div className={`mb-3 ${className}`}>
            {children}
        </div>
    );
};

export const CardTitle: React.FC<{ children: ReactNode; className?: string }> = ({
                                                                                     children,
                                                                                     className = ''
                                                                                 }) => {
    return (
        <h3 className={`text-xl font-bold ${className}`}>
            {children}
        </h3>
    );
};

export const CardContent: React.FC<{ children: ReactNode; className?: string }> = ({
                                                                                       children,
                                                                                       className = ''
                                                                                   }) => {
    return (
        <div className={className}>
            {children}
        </div>
    );
};