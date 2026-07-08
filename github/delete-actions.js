// delete-actions.mjs

const owner = 'Kwisma' // 用户名
const repo = '' // 仓库名
const token = ''


const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
}

async function getRuns() {
    const runs = []

    let page = 1

    while (true) {
        const res = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=100&page=${page}`,
            { headers },
        )

        const data = await res.json()

        runs.push(...data.workflow_runs)

        if (data.workflow_runs.length < 100) break

        page++
    }

    // 最新在前
    runs.sort(
        (a, b) =>
            new Date(b.created_at) - new Date(a.created_at),
    )

    return runs
}

async function deleteRun(id) {
    const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/runs/${id}`,
        {
            method: 'DELETE',
            headers,
        },
    )

    if (!res.ok) {
        throw new Error(await res.text())
    }

    console.log('删除:', id)
}

async function main() {
    const runs = await getRuns()

    console.log(`总共 ${runs.length} 条`)

    // 保留最新一条
    const remove = runs.slice(1)

    console.log(`准备删除 ${remove.length} 条`)

    for (const run of remove) {
        await deleteRun(run.id)
    }

    console.log('完成，已保留最新一条')
}

main()
