import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import store, { persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingSpinner from './src/components/Common/LoadingSpinner';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <AppNavigator />
        <Toast />
      </PersistGate>
    </Provider>
  );
}

export default App;
