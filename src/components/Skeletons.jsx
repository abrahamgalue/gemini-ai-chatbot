const SkeletonUser = () => (
  <div className='chat-bubble user skeleton skeleton-user'>
    <div className='skeleton-text short' />
  </div>
)

export const SkeletonModel = () => (
  <div className='chat-bubble model skeleton skeleton-model'>
    <div className='skeleton-text long' />
    <div className='skeleton-text long' />
    <div className='skeleton-text medium' />
    <div className='skeleton-text short' />
  </div>
)

export const SkeletonChat = () => (
  <>
    <SkeletonUser />
    <SkeletonModel />
  </>
)
