import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../components/supabaseClient';

const ProfileScreen = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (!error) {
                    setProfile(profileData);
                }
            }
        };

        fetchProfile();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setProfile(null); // Clear profile after sign out
    };

    return (
        <View style={styles.container}>
            {profile ? (
                <>
                    <Text style={styles.text}>First Name: {profile.first_name}</Text>
                    <Text style={styles.text}>Last Name: {profile.last_name}</Text>
                    <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                        <Text style={styles.buttonText}>Sign Out</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <Text style={styles.text}>Loading profile...</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    text: {
        fontSize: 18,
        marginBottom: 10,
    },
    signOutButton: {
        backgroundColor: 'red',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
