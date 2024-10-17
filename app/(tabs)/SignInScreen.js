import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { supabase } from '../../components/supabaseClient';
import { useRouter } from 'expo-router';

const SignInScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();

    const isPasswordValid = (password) => {
        return password.length >= 8;
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleSignUp = async () => {
        setError(null);
        console.log('Attempting to sign up user');
    
        // Validate required fields
        if (!firstName || !lastName || !password) {
            setError('First name, last name, and password are required.');
            return;
        }
    
        if (!isPasswordValid(password)) {
            setError('Password must be at least 8 characters long.');
            return;
        }
    
        // Sign up the user
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });
    
        console.log('SignUp Response:', data);
    
        if (signUpError) {
            console.error('Signup error:', signUpError);
            setError(signUpError.message);
            return;
        }
    
        // Wait until user data is available
        await new Promise(resolve => setTimeout(resolve, 2000));
    
        // Check if user data is defined
        const user = data.user;
    
        if (!user) {
            console.error('User not found after sign up. Response:', data);
            setError('User not found after sign up.');
            return;
        }
    
        // Insert user profile using the id
        const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
                id: user.id,
                first_name: firstName, 
                last_name: lastName, 
                avatar_url: 'default_avatar_url.png' 
            }]);
    
        if (insertError) {
            console.error('Insert error:', insertError);
            setError(insertError.message);
            return;
        }
    
        alert('Sign up successful! Please check your email to confirm your account.');
        console.log('Sign up successful!', user);
        router.replace('/');
    };
    
    

    const handleSignIn = async () => {
        setError(null);

        // Validate required fields
        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }

        // Sign in the user with email and password
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        // Check for sign-in error
        if (signInError) {
            console.error('Sign-in error:', signInError);
            setError(signInError.message);
            return;
        }

        // If sign-in is successful, redirect to home screen
        console.log('Sign in successful!', user);
        router.replace('/');
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
        } else {
            console.log('User signed out successfully');
            setEmail('');
            setPassword('');
            setFirstName('');
            setLastName('');
            router.replace('/SignInScreen');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>

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
                secureTextEntry={true}
                style={styles.input}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Button title={isSignUp ? 'Sign Up' : 'Sign In'} onPress={isSignUp ? handleSignUp : handleSignIn} />
            <Button
                title={isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
                onPress={() => setIsSignUp(!isSignUp)} // Toggle between sign up and sign in
            />
            
            {/* Add the sign-out button */}
            <Button title="Sign Out" onPress={handleSignOut} color="red" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 12,
    },
    error: {
        color: 'red',
        marginBottom: 12,
    },
});

export default SignInScreen;
