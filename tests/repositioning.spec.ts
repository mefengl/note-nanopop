/**
 * 重定位功能测试套件
 * 这个文件测试了 nanopop 的自动重定位功能，包括：
 * 1. 防止溢出时的自动重定位
 * 2. 自定义位置尝试顺序
 * 3. 自定义变体尝试顺序
 * 4. 边缘情况处理
 */

import {test} from '@playwright/test';
import {positions, testPage} from './utils';

// 重置快照后缀
test.beforeEach( ({}, testInfo) => testInfo.snapshotSuffix = '');

test.describe('重定位功能测试', () => {

    /**
     * 测试基本的自动重定位功能
     * 场景：弹出层在初始位置会被左侧裁切
     * 预期：自动寻找其他合适的位置
     */
    test('应该能防止左侧溢出', async ({page}) => {
        await testPage(page, 'repositioning-automatic.html');
    });

    /**
     * 测试自定义位置尝试顺序
     * 场景：使用自定义的位置降级顺序
     * 预期：按照指定的顺序尝试各个位置，直到找到合适的位置
     */
    test('应该支持自定义位置尝试顺序', async ({page}) => {
        await testPage(page, 'repositioning-custom-position-order.html');
    });

    /**
     * 测试自定义变体尝试顺序
     * 场景：使用自定义的变体（如 start/middle/end）降级顺序
     * 预期：按照指定的顺序尝试各个变体，直到找到合适的位置
     */
    test('应该支持自定义变体尝试顺序', async ({page}) => {
        await testPage(page, 'repositioning-custom-variant-order.html');
    });

    /**
     * 测试边缘情况下的重定位
     * 场景：参考元素在容器的各个边角处
     * 预期：
     * - top：靠近顶部时应该优先考虑向下定位
     * - right：靠近右侧时应该优先考虑向左定位
     * - bottom：靠近底部时应该优先考虑向上定位
     * - left：靠近左侧时应该优先考虑向右定位
     */
    for (const position of positions) {
        test(`在边缘情况下应该正确处理 ${position} 位置`, async ({page}) => {
            await testPage(page, `repositioning-edge-cases.html#${position}`);
        });
    }
});
