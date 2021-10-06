import React from 'react'
import { screen, render, fireEvent, waitFor, within } from '@testing-library/react'

import GitHubSearchPage from './GitHubSearchPage'

import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getReposListBy, makeFakeRepo, makeFakeResponse } from '../../__fixtures__/repos'
import { OK_STATUS } from '../../consts'
import { handlerPaginated } from '../../__fixtures__/handlers'

const fakeResponse = makeFakeResponse({ totalCount: 1 })
const fakeRepo = makeFakeRepo()
fakeResponse.items = [fakeRepo]

const server = setupServer(
    rest.get('/search/repositories', (req, res, ctx) => {
        // Respond with a mocked user token that gets persisted
        // in the `sessionStorage` by the `Login` component.

        return res(
            ctx.status(OK_STATUS),
            ctx.json(fakeResponse)
        )
    }),
)

beforeAll(() => server.listen())

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

beforeEach(() => render(<GitHubSearchPage />))

let buttonSearch
beforeEach(() => {
    buttonSearch = screen.getByRole('button', { name: /search/i })
})
const fireClickSearch = () => {
    fireEvent.click(buttonSearch)
}

describe('When the GitHubSearchPAge is mounted', () => {

    test('Must display the title', () => {
        //expect(screen.getByText(/github repositories list page/i)).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /github repositories list page/i })).toBeInTheDocument()
    })

    test('An input text with label "filter by" field', () => {

        expect(screen.getByLabelText(/filter by/i)).toBeInTheDocument()
    })

    test('Must be a Search Button', () => {
        expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
    })

    test("Must be a initial message “Please provide a search option and click in the search button” ", () => {
        expect(screen.getByText(/please provide a search option and click in the search button/i)).toBeInTheDocument()
    })

})

describe("When the developer does a search", () => {

    test("The search button should be disabled until the search is done", async () => {

        expect(buttonSearch).not.toBeDisabled()

        fireEvent.change(screen.getByLabelText(/filter by/i), { target: { value: 'test' } })

        expect(buttonSearch).not.toBeDisabled()

        //click btn
        fireClickSearch()

        //expect disabled
        expect(buttonSearch).toBeDisabled()

        //not disabled (finish) async
        await waitFor(() => {
            expect(buttonSearch).not.toBeDisabled()
        })
    })

    test("The data should be displayed as a sticky table", async () => {
        fireClickSearch()

        //not initial state message
        await waitFor(() => {
            expect( // Por lo que entiendo se usa queryByText en vez de getByText, ya q el 2do hace q el test se detenga si no pasa el test, en cambio con queryByText el test no se detiene en caso no pase el test.
                screen.queryByText(/please provide a search option and click in the search button/i)
            ).not.toBeInTheDocument()
        })

        //table
        expect(screen.getByRole('table')).toBeInTheDocument()
    })

    test('The table headers must contain: Repository, stars, forks, open issues and updated at', async () => {
        fireClickSearch()

        const table = await screen.findByRole('table')
        // con whithin es para filtrar los métodos disponibles de un elemento selecionado (en este caso 'table'), en cambio screen aaprecen todo los métodos de manera global
        const tableHeaders = within(table).getAllByRole('columnheader')

        expect(tableHeaders).toHaveLength(5)

        const [repository, start, forks, openIssues, updatedAt] = tableHeaders

        expect(repository).toHaveTextContent(/repository/i)
        expect(start).toHaveTextContent(/stars/i)
        expect(forks).toHaveTextContent(/forks/i)
        expect(openIssues).toHaveTextContent(/open issues/i)
        expect(updatedAt).toHaveTextContent(/updated at/i)

    })

    test('Each table result must contain: owner avatar image, name, stars, updated at, forks, open issues. It should have a link that opens in a new tab.', async () => {
        fireClickSearch()

        const table = await screen.findByRole('table')
        const withTable = within(table)
        const tableCells = withTable.getAllByRole('cell')

        const [repository, start, forks, openIssues, updatedAt] = tableCells

        const avatarImg = within(repository).getByRole('img', { name: fakeRepo.name })
        expect(avatarImg)//Validando si en la celda (fila) repositorio exite una elemento img con alt = test

        expect(tableCells).toHaveLength(5)

        expect(repository).toHaveTextContent(fakeRepo.name)
        expect(start).toHaveTextContent(fakeRepo.stargazers_count)
        expect(forks).toHaveTextContent(fakeRepo.forks_count)
        expect(openIssues).toHaveTextContent(fakeRepo.open_issues)
        expect(updatedAt).toHaveTextContent(fakeRepo.updated_at)
        // screen.debug()
        expect(
            withTable
                .getByText(fakeRepo.name)
                /* .closest('a') */)
            .toHaveAttribute('href', fakeRepo.html_url)

        expect(avatarImg).toHaveAttribute('src', fakeRepo.owner.avatar_url)
    })

    test('Must display the total results number of the search and the current number of results', async () => {
        fireClickSearch()
        await screen.findByRole('table')

        expect(screen.getByText(/1-1 of 1/i)).toBeInTheDocument()
    })

    test('A results size per page select/combobox with the options: 30, 50, 100. The default is 30', async () => {
        fireClickSearch()
        await screen.findByRole('table')

        const elemento = screen.getByLabelText(/rows per page/i)
        expect(elemento).toBeInTheDocument()

        fireEvent.mouseDown(elemento)

        //const options = screen.getAllByRole('option')
        const listbox = screen.getByRole('listbox', { name: /rows per page:/i })

        const options = within(listbox).getAllByRole('option')
        expect(options).toHaveLength(3)

        const [option30, option50, option100] = options

        expect(option30).toHaveTextContent(/30/)
        expect(option50).toHaveTextContent(/50/)
        expect(option100).toHaveTextContent(/100/)
    })

    test('Must exists the next and previous pagination button', async () => {
        fireClickSearch()
        await screen.findByRole('table')

        const preButtom = screen.getByRole('button', { name: /previous page/i })
        const nextButton = screen.getByRole('button', { name: /next page/i })
        expect(preButtom).toBeInTheDocument()
        expect(nextButton).toBeInTheDocument()
        expect(preButtom).toBeDisabled()
    })

})

describe('When the developer does a search without results', () => {

    test("Must show a empty state message 'You search has no results'", async () => {
        // set the mock server no items
        server.use(rest.get('/search/repositories', (req, res, ctx) => (
            res(
                ctx.status(OK_STATUS),
                ctx.json(makeFakeResponse())
            )
        )))

        // click search
        fireClickSearch()

        //expect message no results
        await waitFor(() => (
            expect(screen.getByText(/you search has no results/i)).toBeInTheDocument()
        ))

        //expect no table
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

})

describe('When the developer types on filter by and does a search', () => {
    test('Must display the related repos', async () => {
        //setup the mock server
        const internalFakeResponse = makeFakeResponse()

        const REPO_NAME = 'laravel'

        const expectedRepo = getReposListBy({ name: REPO_NAME })[0]

        server.use(rest.get('/search/repositories', (req, res, ctx) => (
            res(
                ctx.status(OK_STATUS),
                ctx.json(
                    {
                        ...internalFakeResponse,
                        items: getReposListBy({ name: req.url.searchParams.get('q') })
                    }
                )
            )
        )))

        // type for a word in filter by input
        fireEvent.change(screen.getByLabelText(/filter/i), { target: { value: REPO_NAME } })

        // click on search
        fireClickSearch()

        // expect the table content
        const table = await screen.findByRole('table')
        expect(table).toBeInTheDocument()

        const withTable = within(table)
        const tableCells = withTable.getAllByRole('cell')

        const [repository] = tableCells

        expect(repository).toHaveTextContent(expectedRepo.name)
    })
})

describe('When the developer does a search and selects 50 rows per page', () => {

    test('Must fetch a new search and display 50 rows results on the table', async () => {
        //config mock server response
        server.use(rest.get('/search/repositories', handlerPaginated))

        //click search
        fireClickSearch()
        //expect 30 rows length
        const table = await screen.findByRole('table')
        expect(table).toBeInTheDocument()
        const rows = await screen.findAllByRole('row')
        expect(rows).toHaveLength(31)// considerando tambipen la fila cabecera

        //select 50 per page
        fireEvent.mouseDown(screen.getByLabelText(/rows per page/i)) // mouseDown: cuando se quita el click
        fireEvent.click(screen.getByRole('option', { name: '50' }))

        //expect 50 rows length
        await waitFor(() => {//Debe de cambiar el dom ante de hacer un getAllByRole('row')
            expect(screen.getByRole('button', { name: /search/i })).not.toBeDisabled()
        }, { timeout: 3000 })
        expect(screen.getAllByRole('row')).toHaveLength(51)
    })
})

describe.only('When the developer clicks on search and then on next page button', () => {

    test('Must display the next repositories page', async () => {
        //config mock server response
        server.use(rest.get('/search/repositories', handlerPaginated))

        //click search
        fireClickSearch()

        //wait table
        const table = await screen.findByRole('table')
        expect(table).toBeInTheDocument()

        //expect first repo name is from page 0
        expect(screen.getByRole('cell', { name: /1-0/ })).toBeInTheDocument()

        //expect next page is not disabled
        const btnNext = screen.getByRole('button', { name: /next page/i })
        expect(btnNext).not.toBeDisabled()

        //click next page button
        fireEvent.click(btnNext)

        //wait search button is not disabled
        expect(btnNext).toBeDisabled()
    })
})