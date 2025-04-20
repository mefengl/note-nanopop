/**
 * 箭头指示器功能测试套件
 * 箭头指示器是一个小三角形或其他形状的元素，用于指示弹出层和参考元素之间的关系
 * 这个测试文件验证了箭头元素在各种场景下的正确定位，包括：
 * 1. 基本的箭头定位
 * 2. 大尺寸弹出层下的箭头定位
 * 3. 带有变换（transform）的父元素情况下的箭头定位
 */

import { test } from '@playwright/test';
import {positions, variants, testPage} from './utils';

// 重置快照后缀，确保截图对比的一致性
test.beforeEach(({ }, testInfo) => testInfo.snapshotSuffix = '');

test.describe('带箭头选项的弹出层测试', () => {

    /**
     * 测试所有可能的位置和变体组合下的箭头定位
     * 对每个位置组合（如 'top-start'），测试三种不同的场景：
     * 1. with-arrow-custom-position.html - 自定义位置下的箭头
     * 2. with-arrow-large-popper.html - 大尺寸弹出层的箭头
     * 3. with-arrow-transformed-parent.html - 父元素有 transform 时的箭头
     * 
     * 箭头的位置应该：
     * - 在正确的边缘中心
     * - 指向参考元素的中心
     * - 不会超出弹出层的范围
     */
    for (const position of positions) {
        for (const variant of variants) {
            const pos = `${position}-${variant}`;

            test(`在 ${pos} 位置应该正确定位箭头`, async ({ page }) => {
                // 测试自定义位置的箭头
                await testPage(page, `with-arrow-custom-position.html#${pos}`);
                // 测试大尺寸弹出层的箭头
                await testPage(page, `with-arrow-large-popper.html#${pos}`);
                // 测试有 transform 的父元素下的箭头
                await testPage(page, `with-arrow-transformed-parent.html#${pos}`);
            });
        }
    }
});
