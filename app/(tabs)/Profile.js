import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../../components/supabaseClient';
import { Avatar, Icon } from 'react-native-elements';
import IconFA from 'react-native-vector-icons/FontAwesome';

const ProfileScreen = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            const email = user.email;
            setEmail(email);
            console.log(email);

            if (user) {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    setError(profileError.message);
                } else {
                    setProfile(profileData);
                }
            } else if (userError) {
                setError(userError.message);
            }

            setLoading(false);
        };

        fetchProfile();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setProfile(null); // Clear profile after sign out
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : error ? (
                <Text style={styles.errorText}>Error: {error}</Text>
            ) : profile ? (
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <Avatar
                        rounded
                        size="xlarge"
                        title={profile.first_name ? profile.first_name[0] : 'P'}
                        source={{
                            uri: profile.avatar_url || 'https://example.com/default-avatar.png',
                        }}
                        containerStyle={styles.avatar}
                    />
                    <Text style={styles.nameText}>{profile.first_name} {profile.last_name}</Text>
                    <Text style={styles.emailText}>{email}</Text>
                    
                    {/* User Info List */}
                    <View style={styles.infoContainer}>
                       
                        {/* <View style={styles.infoRow}>
                            <Icon name="phone" size={24} color="#007AFF" />
                            <Text style={styles.infoText}>Phone: {profile.phone || 'N/A'}</Text>
                        </View> */}
                        <View style={styles.infoRow}>
                            <IconFA name="check-circle" size={24} color={profile.email_verified ? 'green' : 'red'} />
                            <Text style={styles.infoText}>Email Verified: {profile.email_verified ? 'Yes' : 'No'}</Text>
                                </View>
                                 <View style={styles.infoRow}>
                            <IconFA name="envelope" size={24} color="#007AFF" />
                            <Text style={styles.infoText}>Email: {email}</Text>
                        </View>
                        {/* <View style={styles.infoRow}>
                            <Icon name="info-circle" size={24} color="#007AFF" />
                            <Text style={styles.infoText}>Bio: {profile.bio || 'No bio provided.'}</Text>
                        </View> */}
                    </View>

                    <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                        <Text style={styles.buttonText}>Sign Out</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                <Text style={styles.text}>Profile not found.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
        paddingHorizontal: 20,
    },
    scrollViewContent: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 30,
    },
    avatar: {
        marginBottom: 20,
        backgroundColor: '#007AFF',
    },
    nameText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    emailText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    infoContainer: {
        width: '100%',
        marginBottom: 30,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    infoText: {
        fontSize: 16,
        marginLeft: 10,
        color: '#333',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        marginBottom: 10,
    },
    signOutButton: {
        backgroundColor: 'red',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;