name "insolator"  -- 定义机器的名称

every 1 ticks do  -- 每1个刻（tick）执行以下操作
    input forge_energy:: from "能量" top side  -- 从顶部立方体输入锻造能量
    output forge_energy:: to each "机器"  -- 将能量输出到机器
end

every 20 ticks do  -- 每20个刻（tick）执行以下操作
    input *glass_bottle from "水瓶箱"
    output to each "蜂箱" slots 0
    output to each "装瓶机" slots 0
    forget  -- 清除状态，确保后续操作不受之前步骤影响
    input from "蜂箱" slots 2-10
    output *configurable* to each "离心机"
    output *gene to each "基因检索器"
    output *honey* to each "箱子" 
    forget  -- 清除状态，确保后续操作不受之前步骤影响
    input from "离心机" slots 2-10
    output *gene to each "基因检索器"
    output to each "箱子"
    forget  -- 清除状态，确保后续操作不受之前步骤影响
    input from "装瓶机" slots 11
    output to each "箱子"
    forget  -- 清除状态，确保后续操作不受之前步骤影响
    input *honey_treat from "蜂蜜小食箱"
    output to each "孵化机" slots 1
end
