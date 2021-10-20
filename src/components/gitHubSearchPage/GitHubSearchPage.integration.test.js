import React from 'react'
import { screen, render, fireEvent, waitFor } from '@testing-library/react'

import GitHubSearchPage from './GitHubSearchPage'

import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { makeFakeRepo, makeFakeResponse } from '../../__fixtures__/repos'
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

describe('When the developer clicks on search and then on next page button and then on previous page button', () => {

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

        //search button is disabled
        const btnSearch = screen.getByRole('button', { name: /search/i })
        expect(btnSearch).toBeDisabled()

        //wait search button is not disabled
        await waitFor(() => {
            expect(btnSearch).not.toBeDisabled()
        })

        //expect first repo name is from page 1
        expect(screen.getByRole('cell', { name: /2-0/ })).toBeInTheDocument()

        //click previous page
        const btnPrev = screen.getByRole('button', { name: /previous page/i })
        expect(btnPrev).not.toBeDisabled()

        //click previous page button
        fireEvent.click(btnPrev)

        //wait search finish 
        await waitFor(() => {
            expect(btnSearch).not.toBeDisabled()
        })
        //expect
        expect(screen.getByRole('cell', { name: /1-0/ })).toBeInTheDocument()
    }, 10000)

})

describe('When the developer does a search and clicks on next page button and selects 50 rows per page', () => {
    test('Must display the results of the first page', async () => {
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

        //search button is disabled
        const btnSearch = screen.getByRole('button', { name: /search/i })
        expect(btnSearch).toBeDisabled()

        //wait search button is not disabled
        await waitFor(() => {
            expect(btnSearch).not.toBeDisabled()
        })

        //expect first repo name is from page 1
        expect(screen.getByRole('cell', { name: /2-0/ })).toBeInTheDocument()

        //select 50 per page
        fireEvent.mouseDown(screen.getByLabelText(/rows per page/i)) // mouseDown: cuando se quita el click
        fireEvent.click(screen.getByRole('option', { name: '50' }))

        //expect 50 rows length
        await waitFor(() => {//Debe de cambiar el dom ante de hacer un getAllByRole('row')
            expect(screen.getByRole('button', { name: /search/i })).not.toBeDisabled()
        }, { timeout: 3000 })

        //expect first repo name is from page 0
        expect(screen.getByRole('cell', { name: /1-0/ })).toBeInTheDocument()
    }, 30000)
})

describe('when the developer does a search and clicks on next page button and clicks on search again', () => {
    it('must display the results of the first page', async () => {
        server.use(rest.get('/search/repositories', handlerPaginated))

        fireClickSearch()

        expect(await screen.findByRole('table')).toBeInTheDocument()

        expect(screen.getByRole('cell', { name: /1-0/ })).toBeInTheDocument()

        expect(screen.getByRole('button', { name: /next page/i })).not.toBeDisabled()

        fireEvent.click(screen.getByRole('button', { name: /next page/i }))

        expect(screen.getByRole('button', { name: /search/i })).toBeDisabled()

        await waitFor(
            () =>
                expect(
                    screen.getByRole('button', { name: /search/i }),
                ).not.toBeDisabled(),
            { timeout: 3000 },
        )

        expect(screen.getByRole('cell', { name: /2-0/ })).toBeInTheDocument()

        fireClickSearch()

        await waitFor(() =>
            expect(
                screen.getByRole('button', { name: /search/i }),
            ).not.toBeDisabled()
        )

        expect(screen.getByRole('cell', { name: /1-0/ })).toBeInTheDocument()
    }, 30000)
})
