import React from 'react';
import PropTypes from 'prop-types';
import Colr from 'colr';
import Board from './Board';
import Preview from './Preview';
import Ribbon from './Ribbon';
import Alpha from './Alpha';
import Params from './Params';

import cx from 'classnames';

function noop() {
}

const colr = new Colr();

export default class Panel extends React.Component {
  constructor(props) {
    super(props);

    const color = props.color || props.defaultColor;
    const hsv = colr.fromHex(color).toHsvObject();

    const alpha = typeof props.alpha === 'undefined' ?
      props.defaultAlpha :
      Math.min(props.alpha, props.defaultAlpha);

    this.state = {
      paramsHsv: hsv,
      hsv,
      alpha,
    };

    const events = [
      'onChange',
      'onAlphaChange',
      'onFocus',
      'onBlur',
      'onSystemColorPickerOpen',
    ];
    // bind methods
    events.forEach(m => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.color) {
      const hsv = colr.fromHex(nextProps.color).toHsvObject();
      this.setState({
        hsv,
        paramsHsv: hsv,
      });
    }
    if (nextProps.alpha !== undefined) {
      this.setState({
        alpha: nextProps.alpha,
      });
    }
  }

  onChange(hsvObject, syncParams = true) {
    const hsv = hsvObject;
    const state = {
      hsv,
    };
    if (syncParams) {
      state.paramsHsv = hsv;
    }
    this.setState(state);

    const ret = {
      color: this.getHexColor(hsv),
      hsv,
      alpha: this.state.alpha,
    };
    this.props.onChange(ret);
  }

  onSystemColorPickerOpen(e) {
    // only work with broswer which support color input
    if (e.target.type === 'color') {
      this.systemColorPickerOpen = true;
    }
  }

  onAlphaChange(alpha) {
    if (this.props.alpha === undefined) {
      this.setState({
        alpha,
      });
    }
    this.props.onChange({
      color: this.getHexColor(),
      hsv: this.state.hsv,
      alpha,
    });
  }

  onFocus() {
    if (this._blurTimer) {
      clearTimeout(this._blurTimer);
      this._blurTimer = null;
    } else {
      this.props.onFocus();
    }
  }

  onBlur() {
    if (this._blurTimer) {
      clearTimeout(this._blurTimer);
    }
    this._blurTimer = setTimeout(() => {
      // if is system color picker open, then stop run blur
      if (this.systemColorPickerOpen) {
        this.systemColorPickerOpen = false;
        return;
      }

      this.props.onBlur();
    }, 100);
  }

  getHexColor(hsv) {
    return colr.fromHsvObject(hsv || this.state.hsv).toHex();
  }

  render() {
    const { prefixCls, enableAlpha } = this.props;
    const hsv = this.state.hsv;
    const alpha = this.state.alpha;

    const wrapClasses = cx({
      [`${prefixCls}-wrap`]: true,
      [`${prefixCls}-wrap-has-alpha`]: enableAlpha,
    });

    return (
      <div
        className={[prefixCls, this.props.className].join(' ')}
        style={this.props.style}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        tabIndex="0"
      >
        <div className={`${prefixCls}-inner`}>
          <Board
            rootPrefixCls={prefixCls}
            hsv={hsv}
            onChange={this.onChange}
          />
          <div className={wrapClasses}>
            <div className={`${prefixCls}-wrap-ribbon`}>
              <Ribbon
                rootPrefixCls={prefixCls}
                hsv={hsv}
                onChange={this.onChange}
              />
            </div>
            {enableAlpha &&
              <div className={`${prefixCls}-wrap-alpha`}>
                <Alpha
                  rootPrefixCls={prefixCls}
                  alpha={alpha}
                  hsv={hsv}
                  onChange={this.onAlphaChange}
                />
              </div>
            }
            <div className={`${prefixCls}-wrap-preview`}>
              <Preview
                rootPrefixCls={prefixCls}
                alpha={alpha}
                onChange={this.onChange}
                onInputClick={this.onSystemColorPickerOpen}
                hsv={hsv}
                enableSystemPicker={this.props.enableSystemPicker}
              />
            </div>
          </div>
          <div className={`${prefixCls}-wrap`} style={{ height: 40, marginTop: 6 }}>
            <Params
              rootPrefixCls={prefixCls}
              hsv={this.state.paramsHsv}
              alpha={alpha}
              onAlphaChange={this.onAlphaChange}
              onChange={this.onChange}
              mode={this.props.mode}
              enableAlpha={this.props.enableAlpha}
              disableModeChange={this.props.disableModeChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

import typeColor from './utils/validationColor';

Panel.propTypes = {
  disableModeChange: PropTypes.bool,
  enableSystemPicker: PropTypes.bool,
  alpha: PropTypes.number,
  className: PropTypes.string,
  color: typeColor,
  defaultAlpha: PropTypes.number,
  defaultColor: typeColor,
  enableAlpha: PropTypes.bool,
  mode: PropTypes.oneOf(['RGB', 'HSL', 'HSB']),
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  prefixCls: PropTypes.string,
  style: PropTypes.object,
};

Panel.defaultProps = {
  className: '',
  defaultAlpha: 100,
  defaultColor: '#ff0000',
  enableAlpha: true,
  mode: 'RGB',
  onBlur: noop,
  onChange: noop,
  onFocus: noop,
  prefixCls: 'rc-color-picker-panel',
  style: {},
};
