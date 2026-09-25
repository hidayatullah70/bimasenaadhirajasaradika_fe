import React from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLE_LABELS } from '@/constants/roles';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { User, Mail, Building2, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  return (
    <div>
      <PageHeader title="Profil Saya" description="Informasi akun dan akses Anda." />
      <div className="max-w-lg">
        <Card>
          <CardContent className="pt-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-primary-red/10 flex items-center justify-center mb-3">
                <span className="text-3xl font-bold text-primary-red">
                  {currentUser.name?.[0] ?? 'U'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-ink">{currentUser.name}</h2>
              <span className="text-sm text-muted">{ROLE_LABELS[currentUser.role]}</span>
            </div>

            {/* Details */}
            <div className="space-y-4">
              {[
                { icon: User, label: 'Username', value: currentUser.username },
                { icon: Mail, label: 'Email', value: currentUser.email },
                { icon: Building2, label: 'Departemen', value: currentUser.department },
                { icon: Shield, label: 'Role', value: ROLE_LABELS[currentUser.role] },
              ].map(({ icon: ItemIcon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-canvas border border-border">
                  <ItemIcon className="h-4 w-4 text-muted flex-none" aria-hidden />

                  <div>
                    <p className="text-xs text-muted">{label}</p>
                    <p className="text-sm font-medium text-ink">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3 rounded-lg bg-info/5 border border-info/20">
              <p className="text-xs text-info font-medium">
                {currentUser.permissions?.length ?? 0} izin aktif untuk role ini.
                Hubungi IT Support untuk perubahan akses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
