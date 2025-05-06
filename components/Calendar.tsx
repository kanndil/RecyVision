import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getScanEvents, ScanEvent } from '../services/scanEvents';
import { AntDesign } from '@expo/vector-icons';

interface CalendarProps {
    onDateSelect?: (date: Date) => void;
}

export default function Calendar({ onDateSelect }: CalendarProps) {
    const [scanEvents, setScanEvents] = useState<ScanEvent[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        loadScanEvents();
    }, []);

    const loadScanEvents = async () => {
        try {
            const events = await getScanEvents();
            setScanEvents(events);
        } catch (error) {
            console.error('Error loading scan events:', error);
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        const days = [];
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        
        // Add empty cells at the end to complete the last row
        const totalCells = days.length;
        const remainingCells = 7 - (totalCells % 7);
        if (remainingCells < 7) {
            for (let i = 0; i < remainingCells; i++) {
                days.push(null);
            }
        }
        
        return days;
    };

    const hasScanEvent = (date: Date) => {
        return scanEvents.some(event => {
            const eventDate = new Date(event.timestamp);
            return (
                eventDate.getDate() === date.getDate() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getFullYear() === date.getFullYear()
            );
        });
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        if (onDateSelect) {
            onDateSelect(date);
        }
    };

    const days = getDaysInMonth(currentDate);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        const newDate = new Date(currentDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setCurrentDate(newDate);
                    }}
                >
                    <AntDesign name="left" size={24} color="#82C46B" />
                </TouchableOpacity>
                <Text style={styles.monthText}>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        const newDate = new Date(currentDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setCurrentDate(newDate);
                    }}
                >
                    <AntDesign name="right" size={24} color="#82C46B" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.weekDays}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <Text key={day} style={styles.weekDayText}>{day}</Text>
                ))}
            </View>
            
            <View style={styles.daysGrid}>
                {days.map((date, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dayCell,
                            date && hasScanEvent(date) && styles.scanDay,
                            date && date.getTime() === selectedDate.getTime() && styles.selectedDay
                        ]}
                        onPress={() => date && handleDateSelect(date)}
                    >
                        {date && (
                            <>
                                <Text style={styles.dayText}>{date.getDate()}</Text>
                                {hasScanEvent(date) && (
                                    <View style={styles.checkmarkContainer}>
                                        <AntDesign name="checkcircle" size={12} color="#82C46B" />
                                    </View>
                                )}
                            </>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    weekDays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    weekDayText: {
        fontSize: 14,
        color: '#666',
        width: 40,
        textAlign: 'center',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    dayCell: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
        borderRadius: 20,
    },
    dayText: {
        fontSize: 16,
        color: '#333',
    },
    scanDay: {
        backgroundColor: '#E8F5E9',
    },
    selectedDay: {
        backgroundColor: '#82C46B',
    },
    checkmarkContainer: {
        position: 'absolute',
        bottom: 2,
        right: 2,
    },
}); 