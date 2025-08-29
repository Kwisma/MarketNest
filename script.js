
// 配置模式定义
const MODES = window.e.modes;

// 当前激活的模式
let activeMode = 'mihomo';

// 初始化应用
document.addEventListener('DOMContentLoaded', function () {
    initModeToggle();
    initModeContainers();
    setActiveMode(activeMode);

    // 初始化提示系统
    initTipSystem();

    // 初始化模板选择器
    initAllTemplateSelectors();
});

// 初始化模式切换按钮
function initModeToggle() {
    const modeToggle = document.getElementById('mode-toggle');

    for (const [modeId, modeConfig] of Object.entries(MODES)) {
        const option = document.createElement('div');
        option.className = 'toggle-option';
        option.dataset.mode = modeId;
        option.textContent = modeConfig.name;

        option.addEventListener('click', function () {
            setActiveMode(modeId);
        });

        modeToggle.appendChild(option);
    }
}

// 初始化模式容器
function initModeContainers() {
    const modeContainers = document.getElementById('mode-containers');

    for (const [modeId, modeConfig] of Object.entries(MODES)) {
        const container = document.createElement('div');
        container.id = `${modeId}-container`;
        container.className = 'mode-options';

        // 模板选择器
        if (!modeConfig.noTemplate) {
            const templateSelector = document.createElement('div');
            templateSelector.className = 'template-selector';
            templateSelector.innerHTML = `
                        <div class="template-toggle collapsed">选择配置模板(未选择)</div>
                        <div class="template-options"></div>
                    `;
            container.appendChild(templateSelector);
        }
        // 输入组
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const linkLabel = document.createElement('div');
        linkLabel.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 6px;';
        linkLabel.innerHTML = `
                    <label for="link" style="margin: 0;">订阅链接</label>
                    <div class="tip-wrapper">
                        <span class="tip-icon" data-mode="${modeId}">!</span>
                        <div class="tip-panel"></div>
                    </div>
                `;
        inputGroup.appendChild(linkLabel);

        const linkContainer = document.createElement('div');
        linkContainer.id = `link-container-${modeId}`;
        linkContainer.innerHTML = `
                    <div class="link-row">
                        <input type="text" class="link-input" placeholder="${modeConfig.placeholder}" />
                        <div class="add-btn" onclick="addLinkInput(this, '${modeId}')">➕</div>
                    </div>
                `;
        inputGroup.appendChild(linkContainer);

        // 协议选项
        if (!modeConfig.noTemplate) {
            const protocolLabel = document.createElement('label');
            protocolLabel.textContent = '附加参数选项';
            inputGroup.appendChild(protocolLabel);

            const protocolOptions = document.createElement('div');
            protocolOptions.className = 'protocol-options';

            modeConfig.protocolOptions.forEach(option => {
                const label = document.createElement('label');
                label.className = 'protocol-checkbox';
                label.innerHTML = `
                            <input type="checkbox" name="protocol" value="${option.value}" ${option.checked ? 'checked' : ''}>
                            ${option.label}
                        `;
                protocolOptions.appendChild(label);
            });

            inputGroup.appendChild(protocolOptions);
        }
        container.appendChild(inputGroup);

        // 生成按钮
        const generateButton = document.createElement('button');
        generateButton.textContent = `生成${modeConfig.name}配置`;
        generateButton.onclick = function () { generateConfig(modeId); };
        container.appendChild(generateButton);

        modeContainers.appendChild(container);
    }
}

// 设置活动模式
function setActiveMode(modeId) {
    // 更新切换按钮状态
    document.querySelectorAll('.toggle-option').forEach(option => {
        option.classList.toggle('active', option.dataset.mode === modeId);
    });

    // 更新模式容器显示状态
    document.querySelectorAll('.mode-options').forEach(container => {
        container.classList.toggle('active', container.id === `${modeId}-container`);
    });

    // 更新页面标题和顶部文字
    const modeName = MODES[modeId].name || '';
    document.title = modeName ? `${modeName}配置转换工具` : '配置转换工具';
    const h1Element = document.querySelector('h1');
    if (h1Element) {
        h1Element.textContent = modeName ? `${modeName}配置转换工具` : '配置转换工具';
    }
    updateResult('');
    activeMode = modeId;
}

// 初始化提示系统
function initTipSystem() {
    // 弹窗提示
    document.querySelectorAll('.tip-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();

            // 关闭所有已展开
            document.querySelectorAll('.tip-wrapper').forEach(w => w.classList.remove('active'));

            const wrapper = icon.closest('.tip-wrapper');
            wrapper.classList.toggle('active');

            const panel = wrapper.querySelector('.tip-panel');
            const mode = icon.dataset.mode;

            // 使用 marked 渲染 Markdown 为 HTML
            const rawMarkdown = MODES[mode].tipText || '暂无提示内容';
            panel.innerHTML = DOMPurify.sanitize(marked.parse(rawMarkdown));
        });
    });

    // 点击页面其他地方关闭提示
    document.addEventListener('click', () => {
        document.querySelectorAll('.tip-wrapper').forEach(w => w.classList.remove('active'));
    });
}

// 初始化所有模板选择器
function initAllTemplateSelectors() {
    const configs = window.e.configs;

    for (const modeId of Object.keys(MODES)) {
        if (!MODES[modeId].noTemplate && configs[modeId]) {
            initTemplateSelector(modeId, configs[modeId]);
        }
    }
}

// 初始化模板选择器
function initTemplateSelector(modeId, configGroups) {
    const selector = document.querySelector(`#${modeId}-container .template-selector`);
    const templateToggle = selector.querySelector('.template-toggle');
    const optionsContainer = selector.querySelector('.template-options');

    // 生成所有模板选项
    configGroups.forEach(group => {
        // 添加分组标签
        const groupLabel = document.createElement('div');
        groupLabel.style.padding = '10px 20px';
        groupLabel.style.fontWeight = 'bold';
        groupLabel.style.color = '#555';
        groupLabel.style.backgroundColor = '#f5f5f5';
        groupLabel.textContent = group.label;
        optionsContainer.appendChild(groupLabel);

        // 添加选项
        group.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'template-option';
            optionElement.textContent = option.label;
            optionElement.dataset.value = option.value;
            optionElement.dataset.group = group.label;

            optionElement.addEventListener('click', function () {
                // 移除之前选中的样式
                selector.querySelectorAll('.template-option.selected').forEach(item => {
                    item.classList.remove('selected');
                });

                // 更新显示文本
                templateToggle.textContent = `${group.label}-${option.label}`;

                // 添加选中样式
                this.classList.add('selected');

                // 点击后自动折叠选项面板
                templateToggle.classList.add('collapsed');
                optionsContainer.classList.remove('show');
            });

            optionsContainer.appendChild(optionElement);
        });
    });

    // 默认选择第一个选项
    const firstOption = selector.querySelector('.template-option');
    if (firstOption) {
        firstOption.classList.add('selected');
        const groupLabel = firstOption.dataset.group;
        const optionLabel = firstOption.textContent;
        templateToggle.textContent = `请选择配置模板(默认-${groupLabel})`;
    }

    // 点击切换按钮展开/折叠选项
    templateToggle.addEventListener('click', function () {
        this.classList.toggle('collapsed');
        optionsContainer.classList.toggle('show');
    });

    // 点击页面其他区域关闭选项面板
    document.addEventListener('click', function (event) {
        if (!templateToggle.contains(event.target) && !optionsContainer.contains(event.target)) {
            templateToggle.classList.add('collapsed');
            optionsContainer.classList.remove('show');
        }
    });
}

// 添加链接输入框
function addLinkInput(button, modeId) {
    const container = document.getElementById(`link-container-${modeId}`);
    const row = document.createElement('div');
    row.className = 'link-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'link-input';
    input.placeholder = MODES[modeId].placeholder;

    button.style.display = 'none';
    row.appendChild(input);
    container.appendChild(row);

    const btn = document.createElement('div');
    btn.className = 'add-btn';
    btn.textContent = '➕';
    btn.onclick = function () {
        addLinkInput(btn, modeId);
    };

    row.appendChild(btn);
}

// 生成配置
function generateConfig(modeId) {
    const inputs = document.querySelectorAll(`#${modeId}-container .link-input`);
    let templateLink = '';

    // 只有非v2ray模式才获取选中的模板
    if (!MODES[modeId].noTemplate) {
        const selectedOption = document.querySelector(`#${modeId}-container .template-option.selected`);
        templateLink = selectedOption ? selectedOption.dataset.value : '';
    }
    const protocolParams = {};

    document.querySelectorAll(`#${modeId}-container .protocol-options input[type="checkbox"]`).forEach(checkbox => {
        protocolParams[checkbox.value] = checkbox.checked;
    });

    const subscriptionLinks = Array.from(inputs)
        .map(input => input.value.trim())
        .filter(val => val !== '');

    if (subscriptionLinks.length === 0 && templateLink) {
        alert('请输入至少一个订阅链接');
        return;
    }

    const allLinks = subscriptionLinks.map(link => encodeURIComponent(link));
    const origin = window.location.origin;

    const params = [];

    if (templateLink) {
        params.push(`template=${encodeURIComponent(templateLink)}`);
    }
    if (allLinks.length > 0) {
        params.push(`url=${allLinks.join(',')}`);
    }
    if (modeId) {
        params.push(`${modeId}=true`);
    }

    for (const [protocol, enabled] of Object.entries(protocolParams)) {
        if (enabled) {
            params.push(`${protocol}=true`);
        }
    }

    const urlLink = `${origin}/?${params.join('&')}`;
    updateResult(urlLink);
}

// 复制到剪贴板
function copyToClipboard() {
    const resultInput = document.getElementById('result');
    if (!resultInput.value) {
        return;
    }

    resultInput.select();
    navigator.clipboard.writeText(resultInput.value).then(() => {
        const tooltip = document.createElement('div');
        tooltip.style.position = 'fixed';
        tooltip.style.left = '50%';
        tooltip.style.top = '20px';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.padding = '8px 16px';
        tooltip.style.background = '#4361ee';
        tooltip.style.color = 'white';
        tooltip.style.borderRadius = '4px';
        tooltip.style.zIndex = '1000';
        tooltip.textContent = '已复制到剪贴板';

        document.body.appendChild(tooltip);

        setTimeout(() => {
            document.body.removeChild(tooltip);
        }, 2000);
    }).catch(err => {
        alert('复制失败，请手动复制');
    });
}

// 更新结果和二维码
function updateResult(urlLink) {
    document.getElementById('result').value = urlLink;

    // 生成二维码
    const qrcodeDiv = document.getElementById('qrcode');

    if (urlLink) {
        // 有内容时显示二维码
        qrcodeDiv.classList.add('show');
        qrcodeDiv.innerHTML = '';
        new QRCode(qrcodeDiv, {
            text: urlLink,
            width: 220,
            height: 220,
            colorDark: "#4a60ea",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.L,
            scale: 1
        });
    } else {
        // 无内容时隐藏二维码
        qrcodeDiv.classList.remove('show');
        qrcodeDiv.innerHTML = '';
    }
}
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('qrcode').classList.remove('show');
});
