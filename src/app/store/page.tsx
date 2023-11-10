'use client'

import { io } from 'socket.io-client'
import { useEffect, useState } from 'react'

export default function Home() {

    const socket = io(`${process.env.NEXT_PUBLIC_WS_URI}`)
    const [messages, setMessages] = useState<any>([])
    const [body, setBody] = useState('')
    const [joined, setJoined] = useState(false)
    const [typingTimeout, setTypingTimeout] = useState<any>()
    const [typingDisplay, setTypingDisplay] = useState('')
    const store_id = process.env.NEXT_PUBLIC_STORE_ID
    const buyer_id = process.env.NEXT_PUBLIC_BUYER_ID

    // to join room. it will be a on page load event in the app implementation
    const join = () => {
        socket.emit('join', { id: store_id, type: 'store' }, () => {
            setJoined(true)
        })

    }

    const getAllStoreMessages = () => {
        socket.emit('getAllStoreMessages', { id: store_id }, (response: any) => {
            setMessages(response)
        })
    }

    // To get messages
    useEffect(() => {
        join()
        getAllStoreMessages()

    }, [])

    useEffect(() => { console.log(messages) }, [messages])

    // to update the ui with new messages 
    useEffect(() => {
        socket.on('message', message => {
            getAllStoreMessages()
        })
    }, [])

    useEffect(() => {
        socket.on('typing', ({ id, isTyping }) => {
            if (isTyping) {
                setTypingDisplay(`${id} is typing...`)
            } else {
                setTypingDisplay('')
            }
        })
    })

    const emitTyping = () => {
        socket.emit('typing', { isTyping: true })

        setTypingTimeout(setTimeout(() => {
            socket.emit('typing', { isTyping: false })
        }, 2000))
    }


    // to send new message
    const sendMessage = (e: any) => {
        e.preventDefault()
        socket.emit('createMessage', { buyer_id, store_id, sender_id: store_id, body }, (response: any) => {
            setBody('')
        })
    }

    return (
        <main>
            {messages &&
                <div>
                    {messages.map((message: any, index: number) => (
                        <div key={index}>
                            {message?.texts?.map((text: any, index: number) => (
                                <p key={index}>[{text.sender_name}]:{text.body}</p>
                            ))}
                        </div>
                    ))}
                </div>}
            {typingDisplay && <p>{typingDisplay}</p>}
            <form onSubmit={sendMessage}>
                <input type="text" placeholder='type your message' value={body} onChange={(e) => setBody(e.target.value)} />
                <button type='submit'>Send</button>
            </form>
        </main>
    )
}
