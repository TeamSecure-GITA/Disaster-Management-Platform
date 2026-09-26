import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SOSButton } from '../../components/emergency/SOSButton';

describe('SOSButton Component', () => {
  it('renders correctly in default state', () => {
    const onPress = jest.fn();
    const { getByText } = render(<SOSButton onPress={onPress} size={160} />);
    expect(getByText('HOLD FOR SOS')).toBeTruthy();
  });

  it('invokes onPress callback when activated', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<SOSButton onPress={onPress} testID="sos-btn" />);
    const btn = getByTestId('sos-btn');
    fireEvent.press(btn);
    expect(onPress).toHaveBeenCalled();
  });
});\n