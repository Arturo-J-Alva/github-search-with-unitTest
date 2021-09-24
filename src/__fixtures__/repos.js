import repos30Paginated from './repos-30-paginated.json'
import repos50Paginated from './repos-50-paginated.json'

export const makeFakeResponse = ({ totalCount = 0 } = {}) => ({
    "total_count": totalCount,
    "items": []
})

export const makeFakeRepo = ({
    name = "113922675",
    id = '113922675'
} = {}) => ({
    id,
    name,
    "owner": {
        "avatar_url": "https://avatars.githubusercontent.com/u/8661631?v=4",
    },
    "html_url": "https://github.com/awsdocs/aws-lambda-developer-guide",
    "description": "The AWS Lambda Developer Guide",
    //"updated_at": "2021-07-20T10:46:17Z",
    "updated_at": "2021-07-20",
    "stargazers_count": 1210,
    "forks_count": 964,
    "open_issues": 12,
})

const reposData = ['go', 'freeCodeCamp', 'laravel', 'Python', 'Java']

const reposList = reposData.map(name => makeFakeRepo({ name, id: name }))

export const getReposListBy = ({ name }) => reposList.filter(repo => repo.name === name)

export const getReposPerPage = ({ currentPage, perPage }) => {
    return perPage === 30
        ? repos30Paginated[currentPage]
        : repos50Paginated[currentPage]
}

export default {
    makeFakeResponse,
    makeFakeRepo,
    getReposListBy,
    getReposPerPage
}