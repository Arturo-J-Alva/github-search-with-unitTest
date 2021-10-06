import { Box, Button, Container, Grid, TablePagination, TextField, Typography } from "@material-ui/core"
import { useEffect, useState, useCallback, useRef } from "react"
import { getRepos } from "../../services"
import Content from "../content"
import { GithubTable } from "../githubTable"

const ROWS_PER_PAGE_DEFAULT = 30

const GitHubSearchPage = () => {

    const [isSearching, setIsSearching] = useState(false)
    const [isSearchApplied, setIsSearchApplied] = useState(false)
    const [reposList, setReposList] = useState([])

    const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_DEFAULT)
    const [currentPage, setCurrentPage] = useState(0)

    const didMount = useRef(false)
    const searchByInput = useRef(null)

    const handleSearch = useCallback(async () => {
        setIsSearching(true)
        // await Promise.resolve()
        const res = await getRepos({ q: searchByInput.current.value, rowsPerPage })
        const data = await res.json()
        // console.log("data:", data)
        setReposList(data.items)

        setIsSearching(false)
        setIsSearchApplied(true)
    }, [searchByInput, rowsPerPage])

    // trigger search
    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true
            return
        }
        handleSearch()
    }, [handleSearch])

    const handleChangeRowsPage = (event) => {
        setRowsPerPage(event.target.value)
    }

    const handleChangePage = (_, newPage) => {
        setCurrentPage(newPage)
    }

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h3" component="h1"  >
                    Github Repositories List Page
                </Typography>
            </Box>

            <Grid container spacing={2} justifyContent="space-between">
                <Grid item md={6} xs={12}>
                    <TextField
                        label='Filter By'
                        id='filterBy'
                        fullWidth
                        inputRef={searchByInput} />
                </Grid>
                {/* <label htmlFor="filterBy">Filter By</label>
            <input type="filterBy" id="filterBy" defaultValue="" /> */}
                <Grid item md={3} xs={12}>
                    <Button
                        fullWidth
                        color="primary"
                        variant="contained"
                        disabled={isSearching}
                        onClick={handleSearch}
                    >
                        Search
                    </Button>
                </Grid>
            </Grid>

            <Box my={2}>
                <Content
                    isSearchApplied={isSearchApplied}
                    reposList={reposList}
                >
                    <>
                        <GithubTable
                            reposList={reposList}
                        />
                        <TablePagination
                            rowsPerPageOptions={[30, 50, 100]}
                            component="div"
                            count={1000}
                            rowsPerPage={rowsPerPage}
                            page={currentPage}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPage}
                        />
                    </>
                </Content>
            </Box>

        </Container>
    )
}

export default GitHubSearchPage
