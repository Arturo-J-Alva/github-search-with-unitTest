import { Box, Button, Container, Grid, TextField, Typography } from "@material-ui/core"
import { useEffect, useState, useCallback, useRef } from "react"
import { getRepos } from "../../services"
import Content from "../content"

const GitHubSearchPage = () => {

    const [isSearching, setIsSearching] = useState(false)
    const [isSearchApplied, setIsSearchApplied] = useState(false)
    const [reposList, setReposList] = useState([])
    const [searchBy, setSearchBy] = useState("")
    const [rowsPerPage, setRowsPerPage] = useState(30)

    const didMount = useRef(false)

    const handleSearch = useCallback(async () => {
        setIsSearching(true)
        // await Promise.resolve()
        const res = await getRepos({ q: searchBy, rowsPerPage })
        const data = await res.json()
        // console.log("data:", data)
        setReposList(data.items)

        setIsSearching(false)
        setIsSearchApplied(true)
    }, [searchBy, rowsPerPage])

    const handlerChange = ({ target: { value } }) => {
        setSearchBy(value)
    }

    // trigger search
    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true
            return
        }
        handleSearch()
    }, [handleSearch])

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
                        value={searchBy}
                        onChange={handlerChange} />
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
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage} />
            </Box>

        </Container>
    )
}

export default GitHubSearchPage
