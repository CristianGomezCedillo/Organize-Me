import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { supabase } from './supabaseClient';
import { useRouter } from 'expo-router';

const SignInScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();

    const isPasswordValid = (password) => password.length >= 8;

    const handleSignUp = async () => {
        setError(null);

        if (!firstName || !lastName || !password) {
            setError('First name, last name, and password are required.');
            return;
        }

        if (!isPasswordValid(password)) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

        if (signUpError) {
            setError(signUpError.message);
            return;
        }

        const user = data?.user;
        if (!user) {
            setError('User not found after sign up.');
            return;
        }

        const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, first_name: firstName, last_name: lastName, avatar_url: 'default_avatar_url.png' }]);

        if (insertError) {
            setError(insertError.message);
            return;
        }

        // Send email verification
        await supabase.auth.sendVerificationEmail(email);

        alert('Sign up successful! Please check your email to confirm your account.');
        setIsSignUp(false);
    };

    const handleSignIn = async () => {
        setError(null);

        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }

        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
            setError(signInError.message);
            return;
        }

        // Check if user's email is verified
        if (!user.email_confirmed_at) {
            setError('Please verify your email before logging in.');
            return;
        }

        router.replace('/');
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email to reset the password.');
            return;
        }

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

        if (resetError) {
            setError(resetError.message);
            return;
        }

        Alert.alert('Password Reset', 'A password reset link has been sent to your email.');
    };

    return (
        <View style={styles.container}>
            <View style={styles.topBar} />

            <View style={styles.box}>
                <Image source={require('../assets/images/organizeme.png')} style={styles.logo} />
                <Text style={styles.appTitle}>Organize Me</Text>

                {isSignUp && (
                    <>
                        <TextInput
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                            style={styles.input}
                        />
                    </>
                )}

                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                />

                {error && <Text style={styles.error}>{error}</Text>}

                <TouchableOpacity style={styles.button} onPress={isSignUp ? handleSignUp : handleSignIn}>
                    <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
                </TouchableOpacity>

                {!isSignUp && (
                    <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
                        <Text style={styles.forgotButtonText}>Forgot Password?</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.switchButton} onPress={() => setIsSignUp(!isSignUp)}>
                    <Text style={styles.switchButtonText}>
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.bottomBar} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        backgroundColor: '#87CEEB',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        backgroundColor: '#8B4513',
    },
    box: {
        width: '90%',
        maxWidth: 400,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        alignItems: 'center',
        zIndex: 1,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    appTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    error: {
        color: 'red',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginBottom: 15,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    forgotButton: {
        paddingVertical: 10,
    },
    forgotButtonText: {
        color: '#4CAF50',
        fontSize: 14,
    },
    switchButton: {
        paddingVertical: 10,
        marginBottom: 10,
    },
    switchButtonText: {
        color: '#4CAF50',
        fontSize: 14,
    },
});

export default SignInScreen;
