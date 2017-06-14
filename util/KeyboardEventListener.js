import { LayoutAnimation, Keyboard, Platform } from 'react-native';

export default class KeyboardEventListener {
  static subscribe(callback) {
    const listener = new KeyboardEventListener(callback);
    return () => {
      listener.unsubscribe();
    };
  }

  constructor(callback) {
    this._callback = callback;

    if (Platform.OS === 'ios') {
      this._keyboardDidChangeSubscription = Keyboard.addListener(
        'keyboardWillChangeFrame',
        this._onKeyboardChange
      );
    } else {
      this._keyboardDidShowSubscription = Keyboard.addListener(
        'keyboardDidShow',
        this._onKeyboardChange
      );
      this._keyboardDidHideSubscription = Keyboard.addListener(
        'keyboardDidHide',
        this._onKeyboardChange
      );
    }
  }

  unsubscribe() {
    this._keyboardDidChangeSubscription &&
      this._keyboardDidChangeSubscription.remove();
    this._keyboardDidShowSubscription &&
      this._keyboardDidShowSubscription.remove();
    this._keyboardDidHideSubscription &&
      this._keyboardDidHideSubscription.remove();
  }

  _onKeyboardChange = event => {
    if (!event) {
      this._callback({ keyboardHeight: 0 });
      return;
    }

    const { duration, easing, startCoordinates, endCoordinates } = event;

    let keyboardHeight;
    if (
      Platform.OS === 'ios' &&
      endCoordinates.screenY > startCoordinates.screenY
    ) {
      keyboardHeight = 0;
    } else if (
      Platform.OS === 'ios' &&
      endCoordinates.screenY === startCoordinates.screenY
    ) {
      return;
    } else {
      keyboardHeight = endCoordinates.height;
    }

    let layoutAnimationConfig;
    if (duration && easing) {
      layoutAnimationConfig = {
        duration,
        update: {
          duration,
          type: LayoutAnimation.Types[easing] || 'keyboard',
        },
      };
    }

    this._callback({ keyboardHeight, layoutAnimationConfig });
  };
}
