/**
 * nanopop - 超轻量级的 DOM 元素定位引擎
 * 这个库主要用于实现弹出层（如下拉菜单、提示框等）相对于参考元素的智能定位
 * 它的特点是：
 * 1. 超轻量：压缩后只有约 1KB
 * 2. 零依赖：不依赖任何第三方库
 * 3. 高性能：只在调用时计算位置，不会持续监听
 * 4. 灵活性：支持自定义位置策略和降级方案
 */

/**
 * 基础类型定义
 */
// 方向：上下左右
type Direction = 'top' | 'left' | 'bottom' | 'right';
// 对齐方式：开始、中间、结束
type Alignment = 'start' | 'middle' | 'end';

/**
 * 变体翻转顺序配置接口
 * 当首选的对齐方式无法实现时，定义尝试其他对齐方式的顺序
 * 例如：start: 'sme' 表示先尝试 start，失败后尝试 middle，最后尝试 end
 */
export type VariantFlipOrder = {
    start: string;  // 开始位置的备选顺序
    middle: string; // 中间位置的备选顺序
    end: string;    // 结束位置的备选顺序
};

/**
 * 位置翻转顺序配置接口
 * 当首选的方向无法实现时，定义尝试其他方向的顺序
 * 例如：top: 'tbrl' 表示依次尝试 top、bottom、right、left
 */
export type PositionFlipOrder = {
    top: string;    // 上方位置的备选顺序
    right: string;  // 右侧位置的备选顺序
    bottom: string; // 下方位置的备选顺序
    left: string;   // 左侧位置的备选顺序
};

/**
 * 位置字符串类型
 * 由方向和对齐方式组合而成，例如：'top-start'、'bottom-middle' 等
 */
export type NanoPopPosition = `${Direction}-${Alignment}` | Direction;

/**
 * nanopop 的配置选项接口
 */
export type NanoPopOptions = {
    // 容器的 DOMRect，用于限制弹出层的位置范围
    container: DOMRect;
    // 首选位置
    position: NanoPopPosition;
    // 变体（对齐方式）的备选顺序
    variantFlipOrder: VariantFlipOrder;
    // 位置（方向）的备选顺序
    positionFlipOrder: PositionFlipOrder;
    // 弹出层与参考元素之间的间距
    margin: number;
    // 参考元素（触发元素）
    reference?: HTMLElement;
    // 弹出层元素
    popper?: HTMLElement;
    // 可选的箭头元素
    arrow?: HTMLElement;
    // 弹出层与容器边界的最小间距
    padding?: number;
};

/**
 * 记录各个方向的可用位置
 */
type AvailablePositions = {
    t: number; // top
    b: number; // bottom
    l: number; // left
    r: number; // right
};

/**
 * 记录各种变体（对齐方式）的可用位置
 * vs/vm/ve: vertical start/middle/end
 * hs/hm/he: horizontal start/middle/end
 */
type AvailableVariants = {
    vs: number; // vertical-start
    vm: number; // vertical-middle
    ve: number; // vertical-end
    hs: number; // horizontal-start
    hm: number; // horizontal-middle
    he: number; // horizontal-end
};

/**
 * 箭头元素的可用对齐位置
 */
type AvailableArrowVariants = {
    s: number; // start
    m: number; // middle
    e: number; // end
};

// 方向配对类型
type PositionPairs = [Direction, Direction];

// 位置匹配结果类型：由方向和变体组合而成的两个字符
export type PositionMatch = 'ts' | 'tm' | 'te' | 'bs' | 'bm' | 'be' | 'ls' | 'lm' | 'le' | 'rs' | 'rm' | 're';

/**
 * nanopop 有状态实例的接口
 */
export interface NanoPop {
    // 更新弹出层位置，返回最终应用的位置或 null（如果无法定位）
    update(updatedOptions?: Partial<NanoPopOptions>): PositionMatch | null;
}

/**
 * nanopop 构造函数接口
 * 支持两种调用方式：
 * 1. createPopper(reference, popper, options?)
 * 2. createPopper(options?)
 */
export interface NanoPopConstructor {

    /**
     * @param reference Reference element
     * @param popper Actual popper element
     * @param options Optional options
     */
    (reference: HTMLElement, popper: HTMLElement, options?: Partial<NanoPopOptions>): NanoPop;

    /**
     * @param options Partial options which get merged with the current one
     */
    (options?: Partial<NanoPopOptions>): NanoPop;
}

// 导出当前版本号
export const version = VERSION;

/**
 * 默认配置
 */
export const defaults = {
    // 变体翻转顺序的默认值
    variantFlipOrder: {
        start: 'sme',   // start -> middle -> end
        middle: 'mse',  // middle -> start -> end
        end: 'ems'      // end -> middle -> start
    },
    // 位置翻转顺序的默认值
    positionFlipOrder: {
        top: 'tbrl',    // top -> bottom -> right -> left
        right: 'rltb',  // right -> left -> top -> bottom
        bottom: 'btrl', // bottom -> top -> right -> left
        left: 'lrbt'    // left -> right -> bottom -> top
    },
    // 默认位置为下方
    position: 'bottom',
    // 默认间距为 8px
    margin: 8,
    // 默认内边距为 0
    padding: 0
};

/**
 * 核心定位函数 - 无状态版本
 * @param reference 参考元素（触发元素）
 * @param popper 弹出层元素
 * @param opt 可选的配置选项
 * @returns 成功时返回最终应用的位置（两个字符），失败时返回 null
 */
export const reposition = (
    reference: HTMLElement,
    popper: HTMLElement,
    opt?: Partial<NanoPopOptions>
): PositionMatch | null => {
    // 合并用户配置和默认配置
    const {
        container,
        arrow,
        margin,
        padding,
        position,
        variantFlipOrder,
        positionFlipOrder
    } = {
        container: document.documentElement.getBoundingClientRect(),
        ...defaults,
        ...opt
    };

    /**
     * 重置位置以正确解析视口
     * 参考：https://developer.mozilla.org/en-US/docs/Web/CSS/position#fixed
     */
    const {left: originalLeft, top: originalTop} = popper.style;
    popper.style.left = '0';
    popper.style.top = '0';

    // 获取参考元素和弹出层的位置和尺寸信息
    const refBox = reference.getBoundingClientRect();
    const popBox = popper.getBoundingClientRect();

    /**
     * 存储上下左右四个方向的可用位置坐标
     */
    const positionStore: AvailablePositions = {
        t: refBox.top - popBox.height - margin,    // 上方位置
        b: refBox.bottom + margin,                 // 下方位置
        r: refBox.right + margin,                  // 右侧位置
        l: refBox.left - popBox.width - margin     // 左侧位置
    };

    /**
     * 存储垂直和水平方向上的变体（对齐）位置
     * vs/vm/ve：垂直方向的 start/middle/end 位置
     * hs/hm/he：水平方向的 start/middle/end 位置
     */
    const variantStore: AvailableVariants = {
        vs: refBox.left,                                    // vertical-start
        vm: refBox.left + refBox.width / 2 - popBox.width / 2,  // vertical-middle
        ve: refBox.left + refBox.width - popBox.width,     // vertical-end
        hs: refBox.top,                                    // horizontal-start
        hm: refBox.bottom - refBox.height / 2 - popBox.height / 2,  // horizontal-middle
        he: refBox.bottom - popBox.height                  // horizontal-end
    };

    // 解析位置字符串，例如 'top-start' 拆分为 'top' 和 'start'
    const [posKey, varKey = 'middle'] = position.split('-');
    const positions = positionFlipOrder[posKey as keyof PositionFlipOrder];
    const variants = variantFlipOrder[varKey as keyof VariantFlipOrder];

    // 获取容器的边界值
    const {top, left, bottom, right} = container;

    // 尝试所有可能的位置组合，从首选位置开始
    for (const p of positions) {
        const vertical = (p === 't' || p === 'b');

        // 获取当前位置值
        let positionVal = positionStore[p as keyof AvailablePositions];

        // 确定需要设置的 CSS 属性
        const [positionKey, variantKey] = (vertical ? ['top', 'left'] : ['left', 'top']) as PositionPairs;

        /**
         * 根据方向确定尺寸和限制值
         * positionSize：主方向的尺寸（垂直方向为高度，水平方向为宽度）
         * variantSize：次方向的尺寸
         */
        const [positionSize, variantSize] = vertical ? [popBox.height, popBox.width] : [popBox.width, popBox.height];

        // 确定各个方向的边界值
        const [positionMaximum, variantMaximum] = vertical ? [bottom, right] : [right, bottom];
        const [positionMinimum, variantMinimum] = vertical ? [top, left] : [left, top];

        // 如果当前位置会导致弹出层超出容器，则跳过
        if (positionVal < positionMinimum || (positionVal + positionSize + padding) > positionMaximum) {
            continue;
        }

        // 尝试当前位置下的所有变体（对齐方式）
        for (const v of variants) {
            // 获取变体位置值
            let variantVal = variantStore[((vertical ? 'v' : 'h') + v) as keyof AvailableVariants];

            // 如果变体位置会导致弹出层超出容器，则跳过
            if (variantVal < variantMinimum || (variantVal + variantSize + padding) > variantMaximum) {
                continue;
            }

            // 调整位置值（减去弹出层的初始位置偏移）
            variantVal -= popBox[variantKey];
            positionVal -= popBox[positionKey];

            // 应用样式
            popper.style[variantKey] = `${variantVal}px`;
            popper.style[positionKey] = `${positionVal}px`;

            // 如果有箭头元素，计算箭头的位置
            if (arrow) {
                // 计算参考元素和弹出层的中心偏移
                const refBoxCenterOffset = vertical ? refBox.width / 2 : refBox.height / 2;
                const popBoxCenterOffset = variantSize / 2;

                // 检查参考元素是否比弹出层大
                const isRefBoxLarger = refBoxCenterOffset > popBoxCenterOffset;

                /**
                 * 计算箭头的对齐位置
                 * 如果参考元素比弹出层大，箭头位置以弹出层为准
                 */
                const arrowVariantStore: AvailableArrowVariants = {
                    s: isRefBoxLarger ? popBoxCenterOffset : refBoxCenterOffset,      // start
                    m: popBoxCenterOffset,                                            // middle
                    e: isRefBoxLarger ? popBoxCenterOffset : variantSize - refBoxCenterOffset  // end
                };

                /**
                 * 计算箭头的位置偏移
                 */
                const arrowPositionStore: AvailablePositions = {
                    t: positionSize,  // top
                    b: 0,            // bottom
                    r: 0,            // right
                    l: positionSize  // left
                };

                // 计算箭头的最终位置
                const arrowVariantVal = variantVal + arrowVariantStore[v as keyof AvailableArrowVariants];
                const arrowPositionVal = positionVal + arrowPositionStore[p as keyof AvailablePositions];

                // 应用箭头样式
                arrow.style[variantKey] = `${arrowVariantVal}px`;
                arrow.style[positionKey] = `${arrowPositionVal}px`;
            }

            // 返回成功找到的位置组合（例如 'ts' 表示 top-start）
            return (p + v) as PositionMatch;
        }
    }

    // 如果没有找到合适的位置，恢复弹出层的原始位置
    // 这是对 https://github.com/Simonwep/nanopop/issues/7 的修复
    popper.style.left = originalLeft;
    popper.style.top = originalTop;

    // 返回 null 表示无法找到合适的位置
    return null;
};

/**
 * 创建一个有状态的 popper 实例
 * @param reference 参考元素或配置选项
 * @param popper 弹出层元素
 * @param options 额外的配置选项
 */
export const createPopper: NanoPopConstructor = (
    reference?: HTMLElement | Partial<NanoPopOptions>,
    popper?: HTMLElement,
    options?: Partial<NanoPopOptions>
): NanoPop => {
    // 解析配置选项
    const baseOptions: Partial<NanoPopOptions> = typeof reference === 'object' && !(reference instanceof HTMLElement) ?
        reference : {reference, popper, ...options};

    return {
        /**
         * 更新弹出层位置
         * @param options 可选的新配置，会与现有配置合并
         * @returns 返回最终的位置或 null
         */
        update(options: Partial<NanoPopOptions> = baseOptions): PositionMatch | null {
            const {reference, popper} = Object.assign(baseOptions, options);

            if (!popper || !reference) {
                throw new Error('Popper- or reference-element missing.');
            }

            return reposition(reference, popper, baseOptions);
        }
    };
};
