/**
 * @fileOverview Render a group of bar
 */
import React, { Component, PropTypes, Children } from 'react';
import classNames from 'classnames';
import Animate from 'react-smooth';
import Rectangle from '../shape/Rectangle';
import Layer from '../container/Layer';
import pureRender from '../util/PureRender';
import { PRESENTATION_ATTRIBUTES, getPresentationAttributes } from '../util/ReactUtils';
import _ from 'lodash';

@pureRender
class Bar extends Component {

  static displayName = 'Bar';

  static propTypes = {
    ...PRESENTATION_ATTRIBUTES,
    className: PropTypes.string,
    layout: PropTypes.oneOf(['vertical', 'horizontal']),
    xAxisId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    yAxisId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    stackId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    barSize: PropTypes.number,
    unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dataKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    formatter: PropTypes.func,

    shape: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
    label: PropTypes.oneOfType([
      PropTypes.bool, PropTypes.func, PropTypes.object, PropTypes.element,
    ]),
    data: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      width: PropTypes.number,
      height: PropTypes.number,
      radius: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
    })),
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onClick: PropTypes.func,

    isAnimationActive: PropTypes.bool,
    animationBegin: PropTypes.number,
    animationDuration: PropTypes.number,
    animationEasing: PropTypes.oneOf(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear']),
  };

  static defaultProps = {
    fill: '#000',
    xAxisId: 0,
    yAxisId: 0,
    legendType: 'rect',
    // data of bar
    data: [],
    layout: 'vertical',
    isAnimationActive: true,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: 'ease',
  };

  state = {
    isAnimationFinished: false,
  };

  handleAnimationEnd = () => {
    this.setState({ isAnimationFinished: true });
  };

  renderRectangle(option, props) {
    let rectangle;

    if (React.isValidElement(option)) {
      rectangle = React.cloneElement(option, props);
    } else if (_.isFunction(option)) {
      rectangle = option(props);
    } else {
      rectangle = <Rectangle {...props} className="recharts-bar-rectangle" />;
    }

    return rectangle;
  }

  renderRectangles() {
    const { data, shape, layout, isAnimationActive, animationBegin,
      animationDuration, animationEasing } = this.props;
    const baseProps = getPresentationAttributes(this.props);
    const getStyle = (isBegin) => ({
      transform: `scale${layout === 'vertical' ? 'X' : 'Y'}(${isBegin ? 0 : 1})`,
    });

    return data.map((entry, index) => {
      const { width, height } = entry;
      const props = { ...baseProps, ...entry, index };
      let transformOrigin = '';

      if (layout === 'vertical') {
        transformOrigin = width > 0 ? 'left center' : 'right center';
      } else {
        transformOrigin = height > 0 ? 'center bottom' : 'center top';
      }

      return (
        <Animate begin={animationBegin}
          duration={animationDuration}
          isActive={isAnimationActive}
          easing={animationEasing}
          from={getStyle(true)}
          to={getStyle(false)}
          key={`rectangle-${index}`}
          onAnimationEnd={this.handleAnimationEnd}
        >
          <g style={{ transformOrigin }}>{this.renderRectangle(shape, props)}</g>
        </Animate>
      );
    });
  }

  renderLabelItem(option, props, value) {
    let labelItem;

    if (React.isValidElement(option)) {
      labelItem = React.cloneElement(option, props);
    } else if (_.isFunction(option)) {
      labelItem = option(props);
    } else {
      labelItem = (
        <text {...props} className="recharts-bar-label">
          {_.isArray(value) ? value[1] : value}
        </text>
      );
    }

    return labelItem;
  }

  renderLabels() {
    const { isAnimationActive } = this.props;
    if (isAnimationActive && !this.state.isAnimationFinished) { return null; }
    const { data, label, layout } = this.props;
    const barProps = getPresentationAttributes(this.props);
    const customLabelProps = getPresentationAttributes(label);
    const textAnchor = layout === 'vertical' ? 'start' : 'middle';
    const labels = data.map((entry, i) => {
      let x = 0;
      let y = 0;
      if (layout === 'vertical') {
        x = 5 + entry.x + entry.width;
        y = 5 + entry.y + entry.height / 2;
      } else {
        x = entry.x + entry.width / 2;
      }
      const labelProps = {
        textAnchor,
        ...barProps,
        ...entry,
        ...customLabelProps,
        x,
        y,
        index: i,
        key: `label-${i}`,
        payload: entry,
      };
      let labelValue = entry.value;
      if (label === true && entry.value && labelProps.label) {
        labelValue = labelProps.label;
      }
      return this.renderLabelItem(label, labelProps, labelValue);
    });

    return <Layer className="recharts-bar-labels">{labels}</Layer>;
  }

  render() {
    const { data, className, label } = this.props;

    if (!data || !data.length) { return null; }

    const layerClass = classNames('recharts-bar', className);

    return (
      <Layer className={layerClass}>
        <Layer className="recharts-bar-rectangles">
          {this.renderRectangles()}
        </Layer>
        { label && (
          <Layer className="recharts-bar-rectangle-labels">
            {this.renderLabels()}
          </Layer>
        )}
      </Layer>
    );
  }
}

export default Bar;
