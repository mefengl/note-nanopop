/**
 * 测试工具函数文件
 * 这个文件包含了所有测试套件共用的工具函数和常量
 */

import {expect, Page} from '@playwright/test';

/**
 * 基本方位数组
 * 用于测试弹出层在四个基本方向的定位：
 * - top: 上方
 * - left: 左侧
 * - bottom: 下方
 * - right: 右侧
 */
export const positions = ['top', 'bottom', 'left', 'right'];

/**
 * 变体（对齐方式）数组
 * 用于测试弹出层在每个方向的对齐方式：
 * - start: 起始对齐（左对齐/顶部对齐）
 * - middle: 居中对齐
 * - end: 末尾对齐（右对齐/底部对齐）
 */
export const variants =  ['start', 'middle', 'end'];

/**
 * 测试页面的通用函数
 * 
 * @param page Playwright 的页面对象
 * @param name 测试页面的名称/路径，可能包含哈希值来指定位置（如 'basic.html#top-start'）
 * 
 * 函数流程：
 * 1. 加载指定的测试页面
 * 2. 等待页面网络空闲（确保所有资源加载完成）
 * 3. 等待下一帧（确保 nanopop 的定位更新已应用）
 * 4. 对比页面截图与基准图片（用于视觉回归测试）
 */
export const testPage = async (page: Page, name: string) => {

    // 加载页面，等待网络空闲
    await page.goto(name, {
        waitUntil: 'networkidle'
    });

    // 等待下一帧，确保 nanopop 更新的元素已经显示
    await page.evaluate(() => new Promise(requestAnimationFrame));

    // 对比截图，验证定位结果的正确性
    expect(await page.screenshot()).toMatchSnapshot(`${name}.png`);
};
