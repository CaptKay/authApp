import { useEffect } from 'react'
import {useAuth} from './AuthContext.jsx'
import api from '../api/api.js'

// OPTIONAL helper to normalize /me payload shapes
function normalizeMe(data){
    if(!data) return {user: null, nextPath: "/profile"}
    const user = data.user ?? {
        id: data.id,
        email: data.email,
        roleNames: data.roleNames,
        permissions: data.permissions,
    }
    const nextPath = data.nextPath || '/profile'
    return {user, nextPath}
}


export default function Bootstrap({children}){
    const {setSession, clearSession, setBooting} = useAuth()

    useEffect(()=>{
        let cancelled = false;

        async function run() {
            try {
                const stored = sessionStorage.getItem("accessToken")
                let token = stored

                if(!token){
                    try {
                        const res = await api.post("/auth/refresh")
                        token = res.data?.accessToken || null
                    } catch (error) {
                        console.log(error)

                    }
                }

                if(token){
                    await setSession({token})

                    let me;
                    try {
                        const res = await api.get("/me'")
                        me = normalizeMe(res.data)
                    } catch ( error) {
                        console.log(error)
                        const res = await api.get("/profile/me")
                        me = normalizeMe(res.data)
                    }
                }
            } catch (error) {
                if(!cancelled) clearSession()
                    console.log(error)
            }finally{
            if(!cancelled) setBooting(false)
            }
        }
    },[])
}