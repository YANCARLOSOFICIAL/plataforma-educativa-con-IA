'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';
import { Card } from './ui';

interface FormLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function FormLayout({ title, description, icon, children }: FormLayoutProps) {
  return (
    <div className="min-h-screen mesh-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 rounded-xl glass-strong text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-all hover:scale-105 shadow-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>

        {/* Header Card */}
        <Card variant="gradient" padding="lg" className="mb-8 border-0 shadow-2xl">
          <div className="flex items-center gap-4">
            {icon ? (
              <div className="p-4 bg-gradient-to-br from-primary-500 via-blue-600 to-purple-600 rounded-3xl shadow-2xl animate-float">
                {icon}
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-br from-primary-500 via-blue-600 to-purple-600 rounded-3xl shadow-2xl animate-float">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-primary-600 to-blue-600 bg-clip-text text-transparent dark:from-white dark:via-primary-400 dark:to-blue-400 mb-2">
                {title}
              </h1>
              {description && (
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {description}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Form Content */}
        <Card variant="glass" padding="lg" className="shadow-2xl">
          {children}
        </Card>
      </div>
    </div>
  );
}
