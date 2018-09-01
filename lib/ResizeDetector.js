import { Component, cloneElement } from 'preact';
import ResizeObserver from 'resize-observer-polyfill';
import throttle from 'lodash.throttle';
import { TransparentContainer } from './TransparentContainer';

const styles = {
    position: 'absolute',
    width: 0,
    height: 0,
    visibility: 'hidden',
    display: 'none',
};

export class ResizeDetector extends Component {
    setElement = el => this.el = el;
    getElement = () => this.el && this.el.parentElement;

    onResize = (entries) => {
        entries.forEach((entry) => {
            const { width, height } = entry.contentRect;
            if (this.state.hostWidth !== width || this.state.hostHeight !== height) {
                this.setState({ hostWidth: width, hostHeight: height });
            }
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            hostWidth: undefined,
            hostHeight: undefined,
        };

        const resizeObserver = throttle(this.onResize, props.refreshRate || 250);

        this.ro = new ResizeObserver(resizeObserver);
    }

    componentDidMount() {
        const resizableElement = this.getElement();
        if (resizableElement) this.ro.observe(resizableElement);
    }

    componentWillUnmount() {
        const resizableElement = this.getElement();
        if (resizableElement) this.ro.unobserve(resizableElement);
    }

    renderChildren = () => {
        const { hostWidth, hostHeight } = this.state;
        const { children } = this.props;
        return children.map((child) => cloneElement(child, { hostWidth, hostHeight }));
    };

    render() {
        return (
            <TransparentContainer>
                <div key="resize-detector" style={styles} ref={this.setElement} />
                {this.renderChildren()}
            </TransparentContainer>
        );
    }
}