import { View, Text, TouchableOpacity, Image, TextInput, Modal, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//STILL IN PROGRESS, NEED TO ADD GOOGLE LINKING AND EMAIL SENDING, RIGHT NOW
//IT JUST SAVES THE EMAIL AND NAME TO THE LOCAL STORAGE

const Account = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const insets = useSafeAreaInsets();

  const languages = ['English'];

  // Log email changes
  useEffect(() => {
    if (isGoogleLinked) {
      console.log('Google Account Linked - Email:', email);
    }
  }, [isGoogleLinked, email]);

  const handleSaveName = () => {
    setIsEditingName(false);
  };

  const handleSaveEmail = () => {
    setIsEditingEmail(false);
  };

  const handleGoogleLink = async () => {
    try {
      if (isGoogleLinked) {
        // Handle unlinking
        Alert.alert(
          "Unlink Google Account",
          "Are you sure you want to unlink your Google account? This will remove access to Google Maps features.",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Unlink",
              style: "destructive",
              onPress: () => {
                console.log('Google Account Unlinked - Previous email:', email);
                // Clear user data when unlinking
                setName('');
                setEmail('');
                setIsGoogleLinked(false);
                Alert.alert("Success", "Google account unlinked successfully");
              }
            }
          ]
        );
      } else {
        // TODO: Implement actual Google sign-in
        // This is a placeholder for demonstration. Replace with actual Google Sign-In implementation
        try {
          // Simulating Google Sign-In response
          const mockGoogleUser = {
            user: {
              name: name || "John Doe", // For demo, use existing name or default
              email: email || "johndoe@gmail.com", // For demo, use existing email or default
            }
          };

          // Update user information with Google account data
          setName(mockGoogleUser.user.name);
          setEmail(mockGoogleUser.user.email);
          setIsGoogleLinked(true);
          console.log('Google Account Linked - New email:', mockGoogleUser.user.email);
          Alert.alert("Success", "Google account linked successfully");
        } catch (error) {
          console.error('Google Sign-In Error:', error);
          Alert.alert("Error", "Failed to get Google account information");
        }
      }
    } catch (error) {
      console.error('Google Link Error:', error);
      Alert.alert("Error", "Failed to connect with Google. Please try again.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Profile Section */}
      <View className="items-center mt-8">
        <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: '#82C46B' }}>
          <Text className="text-white text-3xl">
            {name ? name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) : '?'}
          </Text>
        </View>
      </View>

      {/* User Info */}
      <View className="mt-8">
        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-500 text-sm">Name</Text>
            <TouchableOpacity 
              onPress={() => setIsEditingName(true)}
              className="px-3 py-1 rounded-full border border-gray-200"
            >
              <Text className="text-sm" style={{ color: '#82C46B' }}>Edit</Text>
            </TouchableOpacity>
          </View>
          {isEditingName ? (
            <View className="flex-row items-center">
              <TextInput
                value={name}
                onChangeText={setName}
                className="flex-1 text-black text-lg border-b border-gray-300 pb-1"
                autoFocus
                placeholder="Enter your name"
              />
              <TouchableOpacity 
                onPress={handleSaveName}
                className="ml-4 px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#82C46B' }}
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text className="text-black text-lg">
              {name || 'Add your name'}
            </Text>
          )}
        </View>

        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-500 text-sm">Email Address</Text>
            <TouchableOpacity 
              onPress={() => setIsEditingEmail(true)}
              className="px-3 py-1 rounded-full border border-gray-200"
            >
              <Text className="text-sm" style={{ color: '#82C46B' }}>Edit</Text>
            </TouchableOpacity>
          </View>
          {isEditingEmail ? (
            <View className="flex-row items-center">
              <TextInput
                value={email}
                onChangeText={setEmail}
                className="flex-1 text-black text-lg border-b border-gray-300 pb-1"
                autoFocus
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={handleSaveEmail}
                className="ml-4 px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#82C46B' }}
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text className="text-black text-lg">
              {email || 'Add your email'}
            </Text>
          )}
        </View>

        <View className="mb-10">
          <Text className="text-gray-500 text-sm mb-2">Language</Text>
          <TouchableOpacity 
            className="flex-row justify-between items-center py-2 border-b border-gray-200"
            onPress={() => setShowLanguageModal(true)}
          >
            <Text className="text-black text-lg">{selectedLanguage}</Text>
            <Text className="text-gray-400">▼</Text>
          </TouchableOpacity>
        </View>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-semibold">Select Language</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Text className="text-gray-500 text-lg">✕</Text>
                </TouchableOpacity>
              </View>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language}
                  className="py-3 border-b border-gray-100"
                  onPress={() => {
                    setSelectedLanguage(language);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text className={`text-lg ${selectedLanguage === language ? 'text-green-500' : 'text-black'}`}>
                    {language}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Google Account Link Button */}
        <TouchableOpacity 
          onPress={handleGoogleLink}
          className="mt-8 flex-row items-center justify-center bg-white border border-gray-300 rounded-lg py-4 px-6"
          style={isGoogleLinked ? { borderColor: '#82C46B', borderWidth: 2 } : {}}
        >
          <Image 
            source={{ uri: 'https://www.google.com/favicon.ico' }}
            className="w-5 h-5 mr-3"
          />
          <Text className="text-base font-medium" style={{ color: isGoogleLinked ? '#82C46B' : '#000' }}>
            {isGoogleLinked ? 'GOOGLE ACCOUNT LINKED' : 'LINK ACCOUNT WITH GOOGLE'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Account;
