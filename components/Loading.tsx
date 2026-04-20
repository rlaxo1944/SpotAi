import { View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';

function LoadingOverlay() {

    return(
        <View>
            <ActivityIndicator 
            style={{paddingTop: 200}}
            size="large"
            color="green"
            animating={true}
            />
            <Text style={styles.input}>추천할 관광지를 찾는 중이에요.</Text>
        </View>
    );
    
}

export default LoadingOverlay;

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    input: {
        width: '100%',
        marginTop: 50,
        fontSize: 10,
        alignItems:'center',
        justifyContent:'center',
    }
});