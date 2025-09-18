"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Perfil
    name: "Usuário",
    email: "usuario@exemplo.com",
    
    // Notificações
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    
    // Privacidade
    profileVisibility: "public",
    dataSharing: false,
    
    // Aparência
    theme: "whatsapp",
    language: "pt-BR",
    
    // Segurança
    twoFactorAuth: false,
    sessionTimeout: 30,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = () => {
    toast.success("Perfil atualizado com sucesso!");
  };

  const handleSaveNotifications = () => {
    toast.success("Configurações de notificação salvas!");
  };

  const handleSavePrivacy = () => {
    toast.success("Configurações de privacidade salvas!");
  };

  const handleSaveAppearance = () => {
    toast.success("Configurações de aparência salvas!");
  };

  const handleSaveSecurity = () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }
    toast.success("Configurações de segurança salvas!");
  };

  return (
    <div className="main-container">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="page-title text-4xl font-bold mb-2">Configurações</h1>
          <p className="text-gray-600">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>

        <div className="space-y-6">
          {/* Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings({...settings, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleSaveProfile} className="btn btn-primary">
                <Save className="h-4 w-4 mr-2" />
                Salvar Perfil
              </Button>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-gray-600">Receber notificações por email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, emailNotifications: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-gray-600">Receber notificações no navegador</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, pushNotifications: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações SMS</Label>
                  <p className="text-sm text-gray-600">Receber notificações por SMS</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, smsNotifications: checked})
                  }
                />
              </div>
              
              <Button onClick={handleSaveNotifications} className="btn btn-primary">
                <Save className="h-4 w-4 mr-2" />
                Salvar Notificações
              </Button>
            </CardContent>
          </Card>

          {/* Privacidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Visibilidade do Perfil</Label>
                  <p className="text-sm text-gray-600">Tornar perfil público ou privado</p>
                </div>
                <Switch
                  checked={settings.profileVisibility === "public"}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, profileVisibility: checked ? "public" : "private"})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compartilhamento de Dados</Label>
                  <p className="text-sm text-gray-600">Permitir compartilhamento de dados para melhorias</p>
                </div>
                <Switch
                  checked={settings.dataSharing}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, dataSharing: checked})
                  }
                />
              </div>
              
              <Button onClick={handleSavePrivacy} className="btn btn-primary">
                <Save className="h-4 w-4 mr-2" />
                Salvar Privacidade
              </Button>
            </CardContent>
          </Card>

          {/* Aparência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tema</Label>
                <p className="text-sm text-gray-600 mb-2">Escolha o tema da aplicação</p>
                <div className="flex gap-2">
                  <Button
                    variant={settings.theme === "whatsapp" ? "default" : "outline"}
                    onClick={() => setSettings({...settings, theme: "whatsapp"})}
                    className="btn"
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant={settings.theme === "dark" ? "default" : "outline"}
                    onClick={() => setSettings({...settings, theme: "dark"})}
                    className="btn"
                  >
                    Escuro
                  </Button>
                  <Button
                    variant={settings.theme === "light" ? "default" : "outline"}
                    onClick={() => setSettings({...settings, theme: "light"})}
                    className="btn"
                  >
                    Claro
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Idioma</Label>
                <p className="text-sm text-gray-600">Idioma da interface</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={settings.language === "pt-BR" ? "default" : "outline"}
                    onClick={() => setSettings({...settings, language: "pt-BR"})}
                    className="btn"
                  >
                    Português
                  </Button>
                  <Button
                    variant={settings.language === "en" ? "default" : "outline"}
                    onClick={() => setSettings({...settings, language: "en"})}
                    className="btn"
                  >
                    English
                  </Button>
                </div>
              </div>
              
              <Button onClick={handleSaveAppearance} className="btn btn-primary">
                <Save className="h-4 w-4 mr-2" />
                Salvar Aparência
              </Button>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-gray-600">Adicionar camada extra de segurança</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, twoFactorAuth: checked})
                  }
                />
              </div>
              
              <Separator />
              
              <div>
                <Label>Alterar Senha</Label>
                <p className="text-sm text-gray-600 mb-4">Atualize sua senha de acesso</p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveSecurity} className="btn btn-primary">
                <Save className="h-4 w-4 mr-2" />
                Salvar Segurança
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
