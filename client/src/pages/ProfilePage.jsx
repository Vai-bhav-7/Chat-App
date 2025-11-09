import React ,{useContext, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';


const ProfilePage = () => {

  const { authUser, updateProfile} = useContext(AuthContext)

  const [selectedimg, setselectedimg] = useState(null)
  const navigate = useNavigate();
  const [name, setname] = useState(authUser.fullName)
  const [bio, setbio] = useState(authUser.bio)

  const handlesubmit = async (e)=> {
    e.preventDefault();
    if(!selectedimg){
      await updateProfile({fullName: name, bio});
      navigate('/');
      return;
    }

    const render = new FileReader();
    render.readAsDataURL(selectedimg);
    render.onload = async ()=>{
      const base64Image = render.result;
      await updateProfile({profilePic: base64Image, fullName: name, bio});
      navigate('/');
    }
  }

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form onSubmit={handlesubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg'>Profile Details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input onChange={(e)=>setselectedimg(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden/>
            <img src={selectedimg ? URL.createObjectURL(selectedimg) : assets.avatar_icon} alt="" className={`w-12 h-12 ${selectedimg && 'rounded-full'}`}/>
            Upload Profile image
          </label>
          <input onChange={(e)=>setname(e.target.value)} value={name} 
          type="text" required placeholder='Your Name' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'/>
          <textarea rows={4} onChange={(e)=>setbio(e.target.value)} value={bio} placeholder='Write Bio' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'></textarea>
          <button className='bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer' type='submit'>Save</button>
        </form>
        <img  className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedimg && 'rounded-full'}`} src={authUser?.profilepic || assets.logo_icon} alt="" />
      </div>
    </div>
  )
}

export default ProfilePage
