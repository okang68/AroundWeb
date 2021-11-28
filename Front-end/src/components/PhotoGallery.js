import React, {useState, useEffect} from 'react'
import {message, Button} from "antd"
import {DeleteOutlined} from "@ant-design/icons"
import Gallery from 'react-grid-gallery'
import PropTypes from 'prop-types'
import axios from "axios"
import {BASE_URL, SEARCH_KEY, TOKEN_KEY} from "../constants"

const captionStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    maxHeight: "240px",
    overflow: "hidden",
    position: "absolute",
    bottom: "0",
    width: "100%",
    color: "white",
    padding: "2px",
    fontSize: "90%"
}

const wrapperStyle = {
    display: "block",
    minHeight: "1px",
    width: "100%",
    border: "1px solid #ddd",
    overflow: "auto"
}

function PhotoGallery(props) {
    const [images, setImages] = useState(props.images)
    const [curImgIdx, setCurImgIdx] = useState(0)

    const imageArr = images.map(image => {
        return {
            ...image,
            customOverlay: (
                <div style={captionStyle}>
                    <div>{`${image.user}: ${image.caption}`}</div>
                </div>
            )
        }
    })

    const onDeleteImage = () => {
        if (window.confirm(`Are you sure you want to delete this image?`)) {
            const curImg = images[curImgIdx]
            const newImageArr = images.filter((img, index) => index !== curImgIdx)
            console.log('Images left:', newImageArr)

            const opt = {
                method: 'DELETE',
                url: `${BASE_URL}/post/${curImg.postId}`,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
                }
            }

            axios(opt)
                .then(res => {
                    console.log('Deleted image -> ', res)
                    if (res.status === 200) {
                        setImages(newImageArr)
                        props.setPosts(newImageArr)
                        setTimeout(() => {
                            props.setSearchOption({type: SEARCH_KEY.all, keyword: ""})
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

    const onCurrentImageChange = index => {
        console.log('current image index:', index)
        setCurImgIdx(index)
    }

    useEffect(() => {
        setImages(props.images)
    }, [props.images])

    return (
        <div style={wrapperStyle}>
            <Gallery
                images={imageArr}
                enableImageSelection={false}
                backdropClosesModal={true}
                currentImageWillChange={onCurrentImageChange}
                customControls={[
                    <Button
                        style={{marginTop: "10px", marginLeft: "5px"}}
                        key="deleteImage"
                        type="primary"
                        icon={<DeleteOutlined/>}
                        size="small"
                        onClick={onDeleteImage}
                    >Delete Image
                    </Button>
                ]}
            />
        </div>
    )
}

PhotoGallery.propTypes = {
    images: PropTypes.arrayOf(
        PropTypes.shape({
            user: PropTypes.string.isRequired,
            caption: PropTypes.string.isRequired,
            src: PropTypes.string.isRequired,
            thumbnail: PropTypes.string.isRequired,
            thumbnailWidth: PropTypes.number.isRequired,
            thumbnailHeight: PropTypes.number.isRequired,
        })
    ).isRequired
}

export default PhotoGallery
