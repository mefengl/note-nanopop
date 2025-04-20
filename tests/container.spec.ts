/**
 * 容器限制测试套件
 * 这个测试文件验证了当弹出层被限制在特定容器内时的行为
 * 容器限制是一个重要的功能，它确保弹出层：
 * 1. 不会超出指定容器的边界
 * 2. 在容器边缘时能够智能调整位置
 * 3. 正确处理容器内的滚动
 */

import {test} from '@playwright/test';
import {positions, testPage} from './utils';

// 重置快照后缀
test.beforeEach( ({}, testInfo) => testInfo.snapshotSuffix = '');

test.describe('自定义容器测试', () => {

    /**
     * 测试所有基本方向下的边角定位
     * 在容器的四个角落分别测试各个方向的定位
     * 
     * 位置说明：
     * - top: 当弹出层靠近容器顶部时
     * - right: 当弹出层靠近容器右侧时
     * - bottom: 当弹出层靠近容器底部时
     * - left: 当弹出层靠近容器左侧时
     * 
     * 预期行为：
     * - 弹出层应该自动调整位置以避免超出容器
     * - 如果首选位置会导致超出，应该尝试其他可行的位置
     * - 总是保持在容器的可见区域内
     */
    for (const position of positions) {
        test(`在靠近边角处应该正确处理 ${position} 位置`, async ({page}) => {
            await testPage(page, `container.html#${position}`);
        });
    }
});
