import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { login } from '../../api/auth';
import type { LoginScreenProps } from '../../types/navigation';

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      // RootNavigator token useEffect handles redirect automatically
    } catch (err: any) {
      Alert.alert('Login Failed', err?.response?.data?.error ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.inner}>
        <Text style={s.logo}>FORGE</Text>
        <Text style={s.tagline}>Build yourself. Every day.</Text>

        <TextInput style={s.input} placeholder="Email" placeholderTextColor="#555"
          value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address"
          textContentType="emailAddress" autoComplete="email" />

        <TextInput style={s.input} placeholder="Password" placeholderTextColor="#555"
          value={password} onChangeText={setPassword}
          secureTextEntry textContentType="password" autoComplete="password" />

        <TouchableOpacity style={[s.button, loading && s.disabled]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#0D0D0D" /> : <Text style={s.btnText}>Let's Go</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={s.link}>No account? <Text style={s.accent}>Sign up</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  inner:     { flex: 1, justifyContent: 'center', padding: 28 },
  logo:      { fontSize: 42, fontWeight: '900', color: '#FF6B35', letterSpacing: 6, marginBottom: 6 },
  tagline:   { color: '#555', fontSize: 14, marginBottom: 40, letterSpacing: 1 },
  input:     { backgroundColor: '#1C1C1C', borderRadius: 10, padding: 16, color: '#F0F0F0',
               fontSize: 16, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 12 },
  button:    { backgroundColor: '#FF6B35', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  disabled:  { opacity: 0.6 },
  btnText:   { color: '#0D0D0D', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  link:      { color: '#555', textAlign: 'center', fontSize: 14, marginTop: 24 },
  accent:    { color: '#FF6B35', fontWeight: '600' },
});