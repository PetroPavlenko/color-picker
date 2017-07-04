import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import ColorPickerPanel from './Panel';
import placements from './placements';
import Colr from 'colr';

const colr = new Colr();

function refFn(field, component) {
  this[field] = component;
}

function prevent(e) {
  e.preventDefault();
}

export default class ColorPicker extends React.Component {
  constructor(props) {
    super(props);

    const alpha = typeof props.alpha === 'undefined' ?
      props.defaultAlpha :
      Math.min(props.alpha, props.defaultAlpha);

    this.state = {
      color: props.color || props.defaultColor,
      alpha,
      open: false,
    };

    const events = [
      'onTriggerClick',
      'onChange',
      'onBlur',
      'getPickerElement',
      'getRootDOMNode',
      'getTriggerDOMNode',
      'onVisibleChange',
      'setOpen',
      'open',
      'close',
      'focus',
    ];

    events.forEach(e => {
      this[e] = this[e].bind(this);
    });

    this.savePickerPanelRef = refFn.bind(this, 'pickerPanelInstance');
    this.saveTriggerRef = refFn.bind(this, 'triggerInstance');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.color) {
      this.setState({
        color: nextProps.color,
      });
    }
    if (nextProps.alpha !== null && nextProps.alpha !== undefined) {
      this.setState({
        alpha: nextProps.alpha,
      });
    }
  }

  onTriggerClick() {
    this.setState({
      open: !this.state.open,
    });
  }

  onChange(colors) {
    this.setState({
      ...colors,
    }, () => {
      this.props.onChange(this.state);
    });
  }

  onBlur() {
    this.setOpen(false);
  }

  onVisibleChange(open) {
    this.setOpen(open, () => {
      if (open) {
        ReactDOM.findDOMNode(this.pickerPanelInstance).focus();
      }
    });
  }

  setOpen(open, callback) {
    const { onOpen, onClose } = this.props;
    if (this.state.open !== open) {
      this.setState({
        open,
      }, () => {
        if (typeof callback === 'function') {
          callback();
        }

        if (this.state.open) {
          onOpen(this.state);
        } else {
          onClose(this.state);
        }
      });
    }
  }

  getRootDOMNode() {
    return ReactDOM.findDOMNode(this);
  }

  getTriggerDOMNode() {
    return ReactDOM.findDOMNode(this.triggerInstance);
  }

  getPickerElement() {
    // const state = this.state;
    return (
      <ColorPickerPanel

        ref={this.savePickerPanelRef}
        enableSystemPicker={this.props.enableSystemPicker}
        defaultColor={this.state.color}
        alpha={this.state.alpha}
        enableAlpha={this.props.enableAlpha}
        prefixCls={`${this.props.prefixCls}-panel`}
        onChange={this.onChange}
        onBlur={this.onBlur}
        mode={this.props.mode}
        disableModeChange={this.props.disableModeChange}
        className={this.props.className}
      />
    );
  }

  open(callback) {
    this.setOpen(true, callback);
  }

  close(callback) {
    this.setOpen(false, callback);
  }

  focus() {
    if (!this.state.open) {
      ReactDOM.findDOMNode(this).focus();
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const classes = [`${props.prefixCls}-wrap`, props.className];
    if (state.open) {
      classes.push(`${props.prefixCls}-open`);
    }

    let children = props.children;

    const RGBA = colr.fromHex(this.state.color).toRgbArray();

    RGBA.push(this.state.alpha / 100);

    if (children) {
      children = React.cloneElement(children, {
        ref: this.saveTriggerRef,
        unselectable: true,
        style: {
          backgroundColor: `rgba(${RGBA.join(',')})`,
        },
        onClick: this.onTriggerClick,
        onMouseDown: prevent,
      });
    }

    const {
      prefixCls,
      placement,
      style,
      getCalendarContainer,
      align,
      animation,
      disabled,
      transitionName,
    } = props;

    return (
      <div className={classes.join(' ')}>
        <Trigger
          popup={this.getPickerElement()}
          popupAlign={align}
          builtinPlacements={placements}
          popupPlacement={placement}
          action={disabled ? [] : ['click']}
          destroyPopupOnHide
          getPopupContainer={getCalendarContainer}
          popupStyle={style}
          popupAnimation={animation}
          popupTransitionName={transitionName}
          popupVisible={state.open}
          onPopupVisibleChange={this.onVisibleChange}
          prefixCls={prefixCls}
        >
          {children}
        </Trigger>
      </div>
    );
  }
}

ColorPicker.propTypes = {
  disableModeChange: PropTypes.bool,
  enableSystemPicker: PropTypes.bool,
  defaultColor: PropTypes.string,
  defaultAlpha: PropTypes.number,
  // can custom
  alpha: PropTypes.number,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  color: PropTypes.string,
  enableAlpha: PropTypes.bool,
  mode: PropTypes.oneOf(['RGB', 'HSL', 'HSB']),
  onChange: PropTypes.func,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  placement: PropTypes.oneOf(['topLeft', 'topRight', 'bottomLeft', 'bottomRight']),
  prefixCls: PropTypes.string.isRequired,
  style: PropTypes.object,
};

ColorPicker.defaultProps = {
  disableModeChange: false,
  enableSystemPicker: true,
  defaultColor: '#F00',
  defaultAlpha: 100,
  onChange() {
  },
  onOpen() {
  },
  onClose() {
  },
  children: <span className="rc-color-picker-trigger" />,
  className: '',
  enableAlpha: true,
  placement: 'topLeft',
  prefixCls: 'rc-color-picker',
  style: {},
};
