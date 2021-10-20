import { Box, Button, Container, Grid, Snackbar, TablePagination, TextField, Typography } from "@material-ui/core"
import { useEffect, useState, useCallback, useRef } from "react"
import { getRepos } from "../../services"
import Content from "../content"
import { GithubTable } from "../githubTable"

const ROWS_PER_PAGE_DEFAULT = 30
const INITIAL_CURRENT_PAGE = 0
const INITIAL_TOTAL_COUNT = 0

const GitHubSearchPage = () => {

    const [isSearching, setIsSearching] = useState(false)
    const [isSearchApplied, setIsSearchApplied] = useState(false)
    const [reposList, setReposList] = useState([])

    const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_DEFAULT)
    const [currentPage, setCurrentPage] = useState(INITIAL_CURRENT_PAGE)
    const [totalCount, setTotalCount] = useState(INITIAL_TOTAL_COUNT)

    const [open, setOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const didMount = useRef(false)
    const searchByInput = useRef(null)

    const handleSearch = useCallback(async () => {
        try {
            setIsSearching(true)
            // await Promise.resolve()
            const res = await getRepos({ q: searchByInput.current.value, rowsPerPage, currentPage })

            if (!res.ok) {
                throw res
            }

            const data = await res.json()
            // console.log("data:", data)
            setReposList(data.items)
            setTotalCount(data.total_count)
            setIsSearchApplied(true)
        } catch (err) {
            const data = await err.json()
            setOpen(true)
            setErrorMessage(data.message)
        } finally {
            setIsSearching(false)
        }
    }, [rowsPerPage, currentPage])

    // trigger search
    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true
            return
        }
        handleSearch()
    }, [handleSearch])

    const handleChangeRowsPage = (event) => {
        setCurrentPage(INITIAL_CURRENT_PAGE)
        setRowsPerPage(event.target.value)
    }

    const handleChangePage = (_, newPage) => {
        setCurrentPage(newPage)
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false)
    };

    const handleClickSearch = () => {
        if (currentPage === INITIAL_CURRENT_PAGE) {
            handleSearch()
            return
        }

        setCurrentPage(INITIAL_CURRENT_PAGE)
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
                        onClick={handleClickSearch}
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
                            count={totalCount}
                            rowsPerPage={rowsPerPage}
                            page={currentPage}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPage}
                        />
                    </>
                </Content>
            </Box>
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message={errorMessage}
            />
        </Container>
    )
}

export default GitHubSearchPage
