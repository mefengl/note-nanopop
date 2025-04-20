/**
 * 基础功能测试套件
 * 这个文件测试了 nanopop 的基本定位功能，包括：
 * 1. 默认选项下的自动定位
 * 2. 简单位置指定
 * 3. 大尺寸弹出层的处理
 * 4. 内边距和外边距的处理
 * 5. 无解情况的处理
 */

import {test} from '@playwright/test';
import {positions, variants, testPage} from './utils';

// 重置快照后缀，确保每次测试生成的快照文件名一致
test.beforeEach( ({}, testInfo) => testInfo.snapshotSuffix = '');

test.describe('所有位置和默认值测试', () => {

    /**
     * 测试最基础的场景：不提供任何额外选项时的自动定位
     * 预期：弹出层应该被正确定位到参考元素附近
     */
    test('不带任何额外选项时应该正常工作', async ({page}) => {
        await testPage(page, 'basic-auto.html');
    });

    /**
     * 测试未指定变体（对齐方式）的情况
     * 预期：应该使用默认的 middle 对齐方式
     */
    test('未指定变体时应该使用中间对齐', async ({page}) => {
        await testPage(page, 'basic-without-variant.html');
    });

    /**
     * 测试大尺寸弹出层的情况
     * 预期：即使弹出层尺寸较大，也应该能找到合适的位置
     */
    test('应该能处理大尺寸弹出层', async ({page}) => {
        await testPage(page, 'basic-large-popper.html');
    });

    /**
     * 测试另一种大尺寸弹出层的情况
     * 场景：参考元素靠近容器右侧
     */
    test('应该能处理大尺寸弹出层（场景2）', async ({page}) => {
        await testPage(page, 'basic-large-popper-2.html');
    });

    /**
     * 测试内边距功能
     * 预期：弹出层应该和参考元素保持指定的间距
     */
    test('应该正确处理内边距', async ({page}) => {
        await testPage(page, 'basic-padding.html');
    });

    /**
     * 测试无解情况
     * 场景：弹出层太大，无法在任何位置放置而不发生裁切
     * 预期：保持原位，不进行定位
     */
    test('当无法找到合适位置时不应进行定位', async ({page}) => {
        await testPage(page, 'failing.html');
    });

    /**
     * 测试所有可能的位置和变体组合
     * positions：['top', 'bottom', 'left', 'right']
     * variants：['start', 'middle', 'end']
     * 
     * 示例组合：
     * - top-start：弹出层在参考元素上方，左对齐
     * - bottom-middle：弹出层在参考元素下方，居中对齐
     * - left-end：弹出层在参考元素左侧，底部对齐
     */
    for (const position of positions) {
        for (const variant of variants) {
            const pos = `${position}-${variant}`;

            test(`应该能正确处理 ${pos} 位置`, async ({page}) => {
                await testPage(page, `basic-custom-position.html#${pos}`);
            });
        }
    }
});
