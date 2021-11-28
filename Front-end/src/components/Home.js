import React, {useState, useEffect} from "react"
import {Tabs, message, Row, Col, Button} from "antd"
import axios from "axios"
import {SEARCH_KEY, BASE_URL, TOKEN_KEY} from "../constants"
import SearchBar from "./SearchBar"
import PhotoGallery from "./PhotoGallery"
import CreatePostButton from "./CreatePostButton"

const {TabPane} = Tabs

function Home() {
    const [posts, setPosts] = useState([])
    const [activeTab, setActiveTab] = useState("image")
    const [searchOption, setSearchOption] = useState({
        type: SEARCH_KEY.all,
        keyword: ""
    })

    const handleSearch = (option) => {
        const {type, keyword} = option
        setSearchOption({type: type, keyword: keyword})
    }

    useEffect(() => {
        fetchPost(searchOption)
    }, [searchOption, activeTab])

    const fetchPost = (option) => {
        const {type, keyword} = option
        let url

        if (type === SEARCH_KEY.all) {
            url = `${BASE_URL}/search`
        } else if (type === SEARCH_KEY.user) {
            url = `${BASE_URL}/search?user=${keyword}`
        } else {
            url = `${BASE_URL}/search?keywords=${keyword}`
        }

        const opt = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            }
        }

        axios(opt)
            .then((res) => {
                console.log(res)
                if (res.status === 200) {
                    setPosts(res.data)
                    message.success("Posts updated!")
                }
            })
            .catch((err) => {
                message.error("Fetch posts failed!")
                console.log("Fetch posts failed: ", err.message)
            })
    }

    const renderPosts = (type) => {
        if (!posts ||
            posts.length === 0 ||
            (activeTab === "video" && posts.filter((item) => item.type === "video").length === 0) ||
            (activeTab === "image" && posts.filter((item) => item.type === "image").length === 0)
        ) {
            return <div>No data!</div>
        }
        if (type === "image") {
            const imageArr = posts
                .filter((item) => item.type === "image")
                .map((image) => {
                    return {
                        postId: image.id,
                        src: image.url,
                        user: image.user,
                        caption: image.message,
                        thumbnail: image.url,
                        thumbnailWidth: 300,
                        thumbnailHeight: 200
                    }
                })
            return <PhotoGallery images={imageArr} setPosts={setPosts} setSearchOption={setSearchOption}/>
        } else if (type === "video") {
            return (
                <Row gutter={32}>
                    {posts
                        .filter((post) => post.type === "video")
                        .map((post) => (
                            <Col span={8} key={post.url}>
                                <video src={post.url} controls={true} className="video-block"/>
                                <p>{post.user}: {post.message}</p>
                                <Button type="primary" onClick={() => onDeleteVideo(post.id)}>
                                    Delete
                                </Button>
                            </Col>
                        ))}
                </Row>
            )
        }
    }

    const onDeleteVideo = (id) => {
        if (window.confirm(`Are you sure you want to delete this video?`)) {
            const newPostArr = posts.filter((post) => post.id !== id)
            const curVideo = posts.filter((post) => post.id === id)[0]

            const opt = {
                method: 'DELETE',
                url: `${BASE_URL}/post/${curVideo.id}`,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
                }
            }

            axios(opt)
                .then(res => {
                    console.log('Deleted video -> ', res)
                    if (res.status === 200) {
                        setPosts(newPostArr)
                        setTimeout(() => {
                            setSearchOption({type: SEARCH_KEY.all, keyword: ""})
                        }, 1000)
                        message.success("Post deleted!")
                    }
                })
                .catch(err => {
                    message.error('Delete post failed!')
                    console.log('Delete post failed: ', err.message)
                })
        }
    }

    const showPost = (type) => {
        console.log("type -> ", type)
        //setActiveTab(type)
        setTimeout(() => {
            setSearchOption({type: SEARCH_KEY.all, keyword: ""})
        }, 1000)
    }

    const operations = <CreatePostButton onShowPost={showPost}/>
    return (
        <div className="home">
            <SearchBar handleSearch={handleSearch}/>
            <div className="display">
                <Tabs
                    onChange={(key) => setActiveTab(key)}
                    defaultActiveKey="image"
                    activeKey={activeTab}
                    tabBarExtraContent={operations}
                >
                    <TabPane tab="Images" key="image">
                        {renderPosts("image")}
                    </TabPane>
                    <TabPane tab="Videos" key="video">
                        {renderPosts("video")}
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}

export default Home
