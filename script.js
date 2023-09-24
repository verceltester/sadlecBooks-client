// const API_URL = "http://127.0.0.1:8000/api"
const API_URL = "https://books.resurgentindia.org/api"

async function fetchAndDisplayBooks() {
  let res = await fetch(`${API_URL}/book`)

  if (res.status === 200) {
    let books = await res.json();
    const topContainer = document.getElementById('container')
    let booksContainer = document.createElement('div')
    booksContainer.classList.add("box-shadow")
    const bookList = document.createElement('div');
    bookList.setAttribute("id", 'book-list')
    books.map(book => {
      let bookDiv = document.createElement('div')
      bookDiv.classList.add("book")
      let aTag = document.createElement('a');
      aTag.classList.add("text-links")
      let img = document.createElement('img')
      let title = document.createElement('h3');
      title.style.margin = "0px"
      aTag.href = `/book/${book.id}`
      title.innerHTML = `${book.bookTitle}`;
      img.src = `${book.imagelink}`

      aTag.appendChild(img);
      aTag.appendChild(title);
      bookDiv.append(aTag)
      bookList.appendChild(bookDiv);
    })
    booksContainer.appendChild(bookList);
    topContainer.appendChild(booksContainer)
    SetUserLoggedInDisplay()
    hideloader();
  } else {
    somethingWrongMsg()
  }
}

async function fetchAndDisplayBookDetails(url) {
  let res = await fetch(`${API_URL}${url}`)

  if(res.status === 200) {
  let bookDetails = await res.json();

  const topContainer = document.getElementById('container')
  topContainer.style.fontSize = "18px"
  let booksContainer = document.createElement('div')
  booksContainer.classList.add("box-shadow")

  let detailsContainer = document.createElement('div')
  detailsContainer.setAttribute("id", "details-container")
  detailsContainer.innerHTML = `<h1 class="toc-book-title">${bookDetails.bookTitle}</h1>
                                <div id="book-details">
                                  <div id="bookCoverDetails">
                                    <img src="${bookDetails.imagelink}"></img>
                                    <a class="link-btn bookDetailsBtn" href="/book/${bookDetails.id}/toc">Read Book</a>
                                    <a class="link-btn bookDetailsBtn" href="https://www.aurokart.com" target="_blank">Buy Physical Copy</a>
                                  </div>
                                  <div id="bookOtherDetails">
                                    <div><strong>Author</strong>: ${bookDetails.bookAuthor}</div>
                                    <div><strong>Price</strong>: Rs.${bookDetails.bookPrice}</div>                                  
                                    <div>${bookDetails.otherinfo}</div>                                  
                                  </div>
                                </div>`

  booksContainer.appendChild(detailsContainer)

  topContainer.appendChild(booksContainer)

  hideloader()

  SetUserLoggedInDisplay()
  }
    else {
      somethingWrongMsg()
    }
}

async function fetchAndDisplayBookTOC(url) {
  let res = await fetch(`${API_URL}${url}`)

  if(res.status === 200){
  let bookTOC = await res.json();
  
  const topContainer = document.getElementById('container')
  let shadowBox = document.createElement('div')
  shadowBox.classList.add("box-shadow")

  let tocContainer = document.createElement('div')
  tocContainer.classList.add("toc-container")

  let tocTitle = document.createElement('h1')
  tocTitle.classList.add("toc-book-title")
  tocTitle.innerText = bookTOC.bookTitle
  tocContainer.appendChild(tocTitle)

  let TOCList = createTOCwithLinks(bookTOC)
  
  tocContainer.appendChild(TOCList)
  shadowBox.appendChild(tocContainer)
  topContainer.appendChild(shadowBox)
  hideloader();

  // activateTocDropDown()

  SetUserLoggedInDisplay()
  } else {
    somethingWrongMsg()
  }

}

async function fetchAndDisplayChapterText(url) {
  let res = await fetch(`${API_URL}${url}`, {
    headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}
  })
  if(res.status === 401) {
    // let topContainer = document.getElementById('container')
    // let dataContainer = document.createElement('div')
    // dataContainer.classList.add("box-shadow", "error")
    // dataContainer.innerHTML = `Please <a style="text-decoration:underline" class="text-links" href="/login">login</a> to access this section`
    // topContainer.appendChild(dataContainer)
    createLoginModal()
    hideloader();
    localStorage.removeItem("token")
    localStorage.removeItem("uName")
    localStorage.removeItem("profileId")
    SetUserLoggedInDisplay()
  } else if(res.status === 200) {
      let chapText = await res.json();

      let textTopContainer = document.getElementById('container')
      let shadowBox = document.createElement('div')
      shadowBox.classList.add("box-shadow")
    
      let textContainer = document.createElement('div')
      textContainer.classList.add("text-container")

      let urlArray = getNumFromURL(url)
    
      let breadContainer = document.createElement('div')
      breadContainer.classList.add("breadcrumbs")
      let crumb1 = document.createElement('a')
      crumb1.classList.add("text-links")
      crumb1.innerText = `${chapText.currentBook}`
      crumb1.href = `/book/${urlArray[0]}/toc`
      let crumb2 = document.createElement('div')
      crumb2.classList.add("crumbs")
      crumb2.innerText = chapText.chapTitle
      breadContainer.appendChild(crumb1)
      breadContainer.appendChild(crumb2)

      textContainer.appendChild(breadContainer)
    
      let bookTitle = document.createElement('h1')
      bookTitle.classList.add("toc-book-title")
      bookTitle.innerText = chapText.chapTitle
      textContainer.appendChild(bookTitle)
      
      let textDiv = document.createElement('div')
      textDiv.innerHTML = chapText.chapText === null ? "No text" : parseMD(chapText.chapText)

      textContainer.appendChild(textDiv)

      let bottomNavBtns = document.createElement('div')
      bottomNavBtns.classList.add('text-bottom-nav')

      textContainer.appendChild(bottomNavBtns)

      if(chapText.previousUrl !== null) createPrevBtn(chapText, bottomNavBtns)
      if(chapText.nextUrl !== null) createNextBtn(chapText, bottomNavBtns)

      shadowBox.appendChild(textContainer)
      textTopContainer.appendChild(shadowBox)

      hideloader();

      document.getElementById("decreaseFont").classList.remove("hiddenClass")
      document.getElementById("increaseFont").classList.remove("hiddenClass")
      SetUserLoggedInDisplay()


      //add bookmark to every p tag
      handleBookmarkDisplayAction(chapText.chapTitle, url)
      setProgressbarBackToTop() 

      //Scroll into view
      var urlLocation = window.location.toString()
      let checkHref = urlLocation.indexOf('#')
      if(checkHref !== -1){
        urlLocation = urlLocation.slice(urlLocation.indexOf('#')+1);
        const element = document.getElementById(urlLocation);
        element.scrollIntoView();
        element.classList.add("hover")
        setTimeout(() => element.classList.remove("hover"), 4000)
      }

      createTOCModal(urlArray[0])

  } else {
    somethingWrongMsg()
  }

}

async function fetchAndDisplaySubhead1Text(url) {
  let res = await fetch(`${API_URL}${url}`, {
    headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}
  })
  if(res.status === 401) {
    createLoginModal()
    hideloader();
    localStorage.removeItem("token")
    localStorage.removeItem("uName")
    localStorage.removeItem("profileId")
    SetUserLoggedInDisplay()
  } else if(res.status === 200) {
      let subhead1Text = await res.json();

      let textTopContainer = document.getElementById('container')
      let shadowBox = document.createElement('div')
      shadowBox.classList.add("box-shadow")
    
      let textContainer = document.createElement('div')
      textContainer.classList.add("text-container")

      let urlArray = getNumFromURL(url)
    
      let breadContainer = document.createElement('div')
      breadContainer.classList.add("breadcrumbs")
      let crumb1 = document.createElement('a')
      crumb1.innerText = `${subhead1Text.currentBook}`
      crumb1.href = `/book/${urlArray[0]}/toc`
      crumb1.classList.add("text-links")
      let crumb2 = document.createElement('a')
      crumb2.classList.add("crumbs", "text-links")
      crumb2.innerText = `${subhead1Text.Chapter}`
      crumb2.href = `/book/${urlArray[0]}/${urlArray[1]}`
      let crumb3 = document.createElement('div')
      crumb3.classList.add("crumbs")
      crumb3.innerText = subhead1Text.subhead1Titles
      breadContainer.appendChild(crumb1)
      breadContainer.appendChild(crumb2)
      breadContainer.appendChild(crumb3)

      textContainer.appendChild(breadContainer)
    
      let sub1Title = document.createElement('h1')
      sub1Title.classList.add("toc-book-title")
      sub1Title.innerText = subhead1Text.subhead1Titles
      textContainer.appendChild(sub1Title)
      
      let textDiv = document.createElement('div')
      textDiv.innerHTML = subhead1Text.subhead1Text === "" ? "No text" : parseMD(subhead1Text.subhead1Text)

      textContainer.appendChild(textDiv)

      let bottomNavBtns = document.createElement('div')
      bottomNavBtns.classList.add('text-bottom-nav')

      textContainer.appendChild(bottomNavBtns)

      if(subhead1Text.previousUrl !== null) createPrevBtn(subhead1Text, bottomNavBtns)
      if(subhead1Text.nextUrl !== null) createNextBtn(subhead1Text, bottomNavBtns)

      shadowBox.appendChild(textContainer)
      textTopContainer.appendChild(shadowBox)

      hideloader();

      document.getElementById("decreaseFont").classList.remove("hiddenClass")
      document.getElementById("increaseFont").classList.remove("hiddenClass")
      SetUserLoggedInDisplay()

      //add bookmark to every p tag
      handleBookmarkDisplayAction(subhead1Text.subhead1Titles, url)
      setProgressbarBackToTop() 
      
  createTOCModal(urlArray[0])
  } else {
    somethingWrongMsg()
  }

}

async function fetchAndDisplaySubhead2Text(url) {
  let res = await fetch(`${API_URL}${url}`, {
    headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}
  })
  if(res.status === 401) {
    createLoginModal()
    hideloader();
    localStorage.removeItem("token")
    localStorage.removeItem("uName")
    localStorage.removeItem("profileId")
    SetUserLoggedInDisplay()
  } else if(res.status === 200) {
      let subhead2Text = await res.json();

      let textTopContainer = document.getElementById('container')
      let shadowBox = document.createElement('div')
      shadowBox.classList.add("box-shadow")
    
      let textContainer = document.createElement('div')
      textContainer.classList.add("text-container")

      let urlArray = getNumFromURL(url)
    
      let breadContainer = document.createElement('div')
      breadContainer.classList.add("breadcrumbs")
      let crumb1 = document.createElement('a')
      crumb1.innerText = `${subhead2Text.currentBook}`
      crumb1.href = `/book/${urlArray[0]}/toc`
      crumb1.classList.add("text-links")
      let crumb2 = document.createElement('a')
      crumb2.classList.add("crumbs", "text-links")
      crumb2.innerText = `${subhead2Text.currentChapter}`
      crumb2.href = `/book/${urlArray[0]}/${urlArray[1]}`
      let crumb3 = document.createElement('a')
      crumb3.classList.add("crumbs", "text-links")
      crumb3.innerText = `${subhead2Text.Subhead1}`
      crumb3.href = `/book/${urlArray[0]}/${urlArray[1]}/${urlArray[2]}`
      let crumb4 = document.createElement('div')
      crumb4.classList.add("crumbs")
      crumb4.innerText = subhead2Text.subhead2Titles
      breadContainer.appendChild(crumb1)
      breadContainer.appendChild(crumb2)
      breadContainer.appendChild(crumb3)
      breadContainer.appendChild(crumb4)

      textContainer.appendChild(breadContainer)
    
      let sub2Title = document.createElement('h1')
      sub2Title.classList.add("toc-book-title")
      sub2Title.innerText = subhead2Text.subhead2Titles
      textContainer.appendChild(sub2Title)
      
      let textDiv = document.createElement('div')
      textDiv.innerHTML = subhead2Text.subhead2Text === "" ? "No text" : parseMD(subhead2Text.subhead2Text)

      textContainer.appendChild(textDiv)

      let bottomNavBtns = document.createElement('div')
      bottomNavBtns.classList.add('text-bottom-nav')

      textContainer.appendChild(bottomNavBtns)

      if(subhead2Text.previousUrl !== null) createPrevBtn(subhead2Text, bottomNavBtns)
      if(subhead2Text.nextUrl !== null) createNextBtn(subhead2Text, bottomNavBtns)

      shadowBox.appendChild(textContainer)
      textTopContainer.appendChild(shadowBox)

      hideloader();

      document.getElementById("decreaseFont").classList.remove("hiddenClass")
      document.getElementById("increaseFont").classList.remove("hiddenClass")
      SetUserLoggedInDisplay()

      handleBookmarkDisplayAction(subhead2Text.subhead2Titles, url)
      setProgressbarBackToTop();

  createTOCModal(urlArray[0])
  } else {
    somethingWrongMsg()
  }

}

function loginUser() {
  let token = localStorage.getItem("token")
  if (token) { window.open(`/profile`, '_self'); return}  
  let topContainer = document.getElementById("container")
  let shadowContainer = document.createElement('div')
  shadowContainer.classList.add("box-shadow")
  let form = document.createElement('form')

  form.innerHTML = `<form>
    <div class="form-title">
      <h5>Log in to Sadlec Books</h5>
    </div>

    <div class="form-container">
      <label for="uname"><b>Username</b></label>
      <input type="email" placeholder="Enter Username" name="uname" required>

      <label for="psword"><b>Password</b></label>
      <input type="password" placeholder="Enter Password" name="psword" required>
        
      <button class="link-btn" type="submit">Login</button>

      <a class="text-links" href="/register">Register as a new user</a>
    </div>
  </form>`
  // topContainer.appendChild(form)
  shadowContainer.appendChild(form);
  topContainer.appendChild(shadowContainer)
  hideloader()

  form.addEventListener("submit", (e) => {
    showloader()
    e.preventDefault()
      fetch (`${API_URL}/user/login/`, {
        method: 'POST',
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: e.target["uname"].value,
          password: e.target["psword"].value
      }),
    })
    .then((response) => response.json())
    .then((result) => {
      if(result.errors){
        hideloader()
        showInfoToast("Wrong credentials.")
        } else {
          hideloader()
          localStorage.setItem("token", result.token['access token'])
          localStorage.setItem("uName", result.user)
          localStorage.setItem("profileId", result.profileId)
          let redirUrl = localStorage.getItem("redirUrl")
          if (redirUrl) {
            localStorage.removeItem("redirUrl")
            window.open(redirUrl, '_self')
          } else {
            window.open(`/`, '_self')
          }        
        }
    }) .catch((err) => {
      console.log(err)
    })
  })

}

function registerNewUser() {
  let token = localStorage.getItem("token")
  if (token) { window.open(`/profile`, '_self'); return}  
  let topContainer = document.getElementById("container")
  let shadowContainer = document.createElement('div')
  shadowContainer.classList.add("box-shadow")
  let form = document.createElement('form')

  form.innerHTML = `<form class="login-form">
  <div class="form-title">
    <span>Register as a new user</span>
  </div>

  <div class="form-container">
    <label for="name"><b>Name*</b></label>
    <input type="text" placeholder="Enter your name" name="name" required>

    <label for="uname"><b>Username*</b></label>
    <input type="email" placeholder="Enter email" name="uname" required>

    <label for="birthday">Birthday</label>
    <input type="date" id="birthday" name="birthday" required> 

    <label for="psword"><b>Password*</b></label>
    <input type="password" placeholder="Enter Password" name="psword" required>

    <label for="cnfpsword"><b>Confirm Password*</b></label>
    <input type="password" placeholder="Enter Password again" name="cnfpsword" required>

    <div style='display:inline; font-size: 1.3rem'><input type="checkbox" name="tc" require>
    <label for="tc">I agree to the terms and conditions.* </label></div>
      
    <button class="link-btn" type="submit">Register</button>
  </div>
</form>`
  shadowContainer.appendChild(form);
  topContainer.appendChild(shadowContainer)
  hideloader()

form.addEventListener("submit", (e) => {
  e.preventDefault()
  if (e.target['cnfpsword'].value !== e.target["psword"].value) {
    showInfoToast("Passwords don't match")
    return
  }
  if (!e.target['tc'].checked) {
    showInfoToast("Please agree to the terms and conditions.")
    return
  }
  console.log(e.target['birthday'].value)
  showloader()
  fetch (`${API_URL}/user/register/`, {
    method: 'POST',
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: e.target["uname"].value,
      password: e.target["psword"].value,
      name: e.target['name'].value,
      password2: e.target['cnfpsword'].value,
      birthday: e.target['birthday'].value,
      tc: e.target['tc'].checked
   }),
  })
 .then((response) => response.json())
 .then((result) => {
   hideloader()
   if(result.errors?.email){
    showInfoToast("Email already registered.")
     return
    } else {
      form.innerHTML = `<form class="login-form">
  <div class="form-title">
    <span style="font-size:2.5rem;">User created. <a style="text-decoration:underline;" class="text-links" href="/login">Click here</a> to login.</span>
  </div> </form>`
    }
 }) .catch((err) => {
   console.log(err)
 })
})

}

async function profileSection() {
  let res = await fetch(`${API_URL}/user/profile`, {
    headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`},
  })
  if(res.status === 401) {
    let topContainer = document.getElementById('container')
    let dataContainer = document.createElement('div')
    dataContainer.classList.add("box-shadow", "error")
    dataContainer.innerHTML = `Please <a style="text-decoration:underline" class="text-links" href="/login">login</a> to access your profile.`
    topContainer.appendChild(dataContainer)
    hideloader();
    localStorage.removeItem("token")
    localStorage.removeItem("uName")
    localStorage.removeItem("profileId")
    SetUserLoggedInDisplay()
  } else if (res.status === 200) {
    let profileData = await res.json()
    console.log(profileData)
    let topContainer = document.getElementById("container")
    let shadowContainer = document.createElement('div')
    shadowContainer.classList.add("box-shadow")

    let detailsContainer = document.createElement('div')
    detailsContainer.setAttribute('id', "profile-details-container")

    let welcomeTitle = document.createElement('h1')
    welcomeTitle.innerText = `Hello ${profileData.name}`
    detailsContainer.appendChild(welcomeTitle)

    let profileDetails = document.createElement('div')
    profileDetails.setAttribute("id", "profile-details")

    let emailDiv = document.createElement('div')
    emailDiv.setAttribute("id", "profile-email")
    emailDiv.innerHTML = `<strong>Email:</strong> ${profileData.email}`
    profileDetails.appendChild(emailDiv)

    let profileImage = document.createElement('div')
    profileImage.setAttribute("id", "profile-img")

    profileImage.innerHTML = `<strong>Profile image:</strong> <img style="width:43px" src="/assets/defaultAvatar.png"></img>`
    profileDetails.appendChild(profileImage)

    // let upload = document.createElement('div')
    // upload.innerHTML = `<input type="file" id="file">
    // <button id="upload-button">Upload</button>
    //     <small id="status"></small>`
    // profileImage.appendChild(upload)

    let bookmarks = document.createElement('div')
    bookmarks.setAttribute("id", "bookmarks")
    let sectionTitle = document.createElement('h3')
    sectionTitle.innerText = "Your bookmarks :"
    bookmarks.appendChild(sectionTitle)
    profileData.profile.mybookmark.map((bookm, i) => {
      let bookmarkDiv = document.createElement('div')
      bookmarkDiv.classList.add('indi-bookmark')
      bookmarkDiv.innerHTML = `<div class="bookmark-title">
                                <a class="text-links" href="${bookm.bookmarks.url}">${i+1}. 🔗${bookm.bookmarks.bookmarkTitle}
                                <div>(${bookm.bookmarks.content}...)</div></a></div>
                                <img id="${bookm.id}" class="del-bookmark-img" src="/assets/bin.png"></img>`
      bookmarks.appendChild(bookmarkDiv)
    })
    profileDetails.appendChild(bookmarks)
    
    detailsContainer.appendChild(profileDetails)
    shadowContainer.appendChild(detailsContainer)
    topContainer.appendChild(shadowContainer)
    hideloader();
    SetUserLoggedInDisplay()

    
    // let uploadBtn = document.getElementById("upload-button")
    // uploadBtn.addEventListener("click", (e) => {
    //   const file = document.getElementById('file');
    //   const fileReader = new FileReader();
    //   fileReader.readAsArrayBuffer(file.files[0]);
    //   fileReader.onload = (event) => {
    //     console.log('Complete File read successfully!')
        
    //     fetch (`${API_URL}/user/profilepicupdate/`, {
    //       method: 'PUT',
    //       headers: {
    //         Accept: "application/json, text/plain, */*",
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         email: e.target["uname"].value,
    //         password: e.target["psword"].value,
    //         name: e.target['name'].value,
    //         password2: e.target['cnfpsword'].value,
    //         tc: e.target['tc'].checked
    //      }),
    //     })
    //    .then((response) => response.json())
    //    .then((result) => {
    //      hideloader()
    //    }) .catch((err) => {
    //      console.log(err)
    //    })
    //   }
    //   // console.log(file.files[0])
    // })

    let deleteBookmarksImg = document.getElementsByClassName("del-bookmark-img")
    for(let i = 0; i<deleteBookmarksImg.length; i++) {
      deleteBookmarksImg[i].addEventListener('click', (e) => {
        showloader()
        showInfoToast("Deleting bookmark")
        fetch (`${API_URL}/user/bookmark/`, {
          method: 'DELETE',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
              "bookmarkId": `${e.target.id}`,
              "profileId": `${localStorage.getItem("profileId")}`
            }),
        })
        .then((response) => response.json())
        .then((result) => {          
          location.reload()
        })
      })
    }
  }

   else {
    let topContainer = document.getElementById('container')
    let dataContainer = document.createElement('div')
    dataContainer.classList.add("box-shadow", "error")
    dataContainer.innerHTML = `Something went wrong. Please try again.`
    topContainer.appendChild(dataContainer)
    hideloader();
    SetUserLoggedInDisplay()
  }
}



// Utility Functions ======================================//

function parseMD(text){
  let md = window.markdownit({html:true}).use(markdownitFootnote)
  let modtext = text.replaceAll('\\n\\n', "\n\n")
  modtext = modtext.replaceAll('\\n', "<br>")
  return md.render(modtext)
  // modtext = text.replaceAll('\\n\\n', "\n\n")
  // return modtext
}

function SetUserLoggedInDisplay() {
  let logArea = document.getElementById("navbarUserMenu")
  let loginMenu = document.getElementById("loginMenu")
  let defaultAvatar = document.getElementById("navbarBtnImg")

  let isLoggedIn = localStorage.getItem("token")

  if(isLoggedIn) {
    // defaultAvatar.setAttribute("id", "navbarBtnImg")
    // defaultAvatar.src = '/assets/defaultAvatar.png'
    // logArea.appendChild(defaultAvatar)
    loginMenu.innerHTML = `<div><a class="text-links" href="/profile">Profile</a></div>
    <div"><a class="text-links" href="/profile">Bookmarks</a></div>
    <div id="logoutBtn"><a class="text-links" href="/">Logout</a></div>`
    document.getElementById('logoutBtn')
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem("token")
      localStorage.removeItem("uName")
      localStorage.removeItem("profileId")
      window.open('/', '_self')
    })
  } else {
    // defaultAvatar.src = '/assets/defaultAvatar.png'
    // logArea.appendChild(defaultAvatar)
    loginMenu.innerHTML = `<div><a class="text-links" href="/login">Login</a></div>
    <div><a class="text-links" href="/register">Register</a></div>`
  }

  logArea.addEventListener('click', () => {
    loginMenu.classList.toggle("hiddenClass")
  })

  window.addEventListener('click', function(e) {
    if (e.target !== defaultAvatar) {
    loginMenu.classList.add("hiddenClass")
    }
  }) 
}

function showInfoToast(msg) {
  var infoToast = document.getElementById("infoToast");
  infoToast.innerText= msg
  infoToast.classList.add("show")


  setTimeout(function(){ infoToast.classList.remove("show"); }, 4000);
}

function createTOCwithLinks(TOCData){
  
  const TOCList = document.createDocumentFragment();
  
  TOCData.chap.map((chaps, i) => {
    let aTag = document.createElement('a');
    aTag.href = `/book/${TOCData.id}/${chaps.id}`
    let chapter = document.createElement('h1')
    chapter.innerText = `Chapter ${i+1}. ${chaps.chapTitle}`
    chapter.classList.add("chapName", "text-links")
    aTag.appendChild(chapter)
    TOCList.appendChild(aTag)
    // let chapKids = document.createElement("div")
    // chapKids.classList.add("tocChapKids")
    chaps.sub1.map(sub1 => {
      let aTag = document.createElement('a');
      aTag.href = `/book/${TOCData.id}/${chaps.id}/${sub1.id}`
      let subhead1 = document.createElement("h2")
      subhead1.innerText = sub1.subhead1Titles
      subhead1.classList.add("sub1Name", "text-links")
      aTag.appendChild(subhead1)
      TOCList.appendChild(aTag)
      sub1.sub2.map(sub2name => {
        let aTag = document.createElement('a');
        aTag.href = `/book/${TOCData.id}/${chaps.id}/${sub1.id}/${sub2name.id}`
        let subhead2 = document.createElement('h2')
        subhead2.innerText = sub2name.subhead2Titles
        subhead2.classList.add("sub2Name", "text-links")
        aTag.appendChild(subhead2)
        TOCList.appendChild(aTag)
      })
    })
    // TOCList.appendChild(chapKids)
  })

  return TOCList
}

function activateTocDropDown() {
  var acc = document.getElementsByClassName("tocDropDownBtn");
  var kid = document.getElementsByClassName("tocChapKids");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var parent = this.parentElement;
    panel = parent.nextElementSibling
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  });
}
}

function handleBookmarkDisplayAction(chapTitle, url) {
  let currentParaId = null
  let currentParaBookMarkContent = null
  let bookmarkBtn = document.getElementById("bookmarkBtn")
  let bookmarkImg = document.createElement("img")
  bookmarkImg.src = '/assets/bookmark.jpg'
  bookmarkBtn.appendChild(bookmarkImg)
  bookmarkBtn.addEventListener('click', (e) => {
    if(currentParaId){
      showloader()
      fetch (`${API_URL}/user/bookmark/`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "bookmarks":{
            "bookmarkTitle":`${chapTitle}`,
            "url":`${url}#${currentParaId}`,
            "content": `${currentParaBookMarkContent}`
          },
          "profile":`${localStorage.getItem("profileId")}`
          }),
      })
      .then((response) => {
        if(response.status === 201)
        showInfoToast("Bookmark added!")
        else if (response.status === 401)
        showInfoToast("Bookmark already added!")
        console.log(response)
        hideloader()
      })
    }
  })
  
  let pTags = document.getElementsByTagName("p")
      for(let i = 0; i < pTags.length; i++) {
        pTags[i].setAttribute('id', i+1)
        if (pTags[i].textContent === "* * *") {pTags[i].style.textAlign = "center"}
        pTags[i].addEventListener("mouseover", (e) => {
          if(e.target.localName === 'p'){
            e.target.style.position = 'relative'
            currentParaId = e.target.id
            currentParaBookMarkContent = e.target.textContent.slice(0, 20)
          }
          pTags[i].prepend(bookmarkBtn)
        })
      }
      
}

function createTOCModal(bookNumber) {
  let tocModal = document.getElementById('tocModal')
  let tocModalImg = document.createElement('img')
  tocModalImg.src = "/assets/book.png"
  tocModal.appendChild(tocModalImg)

  let modalView = document.getElementById('tocModalView')
  let closeBtn = document.getElementById('closeBtn')
  let modalContent = document.getElementById('modal-text')

  tocModal.addEventListener('click', async () => {
    modalView.style.display = 'block'
    showloader()

    let res = await fetch(`${API_URL}/book/${bookNumber}/toc`)
    let bookTOC = await res.json()

    let TOCList = createTOCwithLinks(bookTOC)
    modalContent.appendChild(TOCList)
    hideloader()
  })

  closeBtn.onclick = function() {
    modalView.style.display = 'none'
  }

  window.onclick = function(e) {
    if (e.target == modalView) {
      modalView.style.display = "none";
      console.log("modalClick")
    }
  }
}

function createLoginModal() {
  let modalView = document.getElementById('tocModalView')
  let closeBtn = document.getElementById('closeBtn')
  closeBtn.style.display = "none"
  let modalContent = document.getElementById('modal-text')

  let form = document.createElement('form')

  form.innerHTML = `<form>
    <div class="form-title">
      <h5>Log in to Sadlec Books</h5>
    </div>

    <div class="form-container">
      <label for="uname"><b>Username</b></label>
      <input type="email" placeholder="Enter Username" name="uname" required>

      <label for="psword"><b>Password</b></label>
      <input type="password" placeholder="Enter Password" name="psword" required>
        
      <button class="link-btn" type="submit">Login</button>

      <a class="text-links" href="/register">Register as a new user</a>
    </div>
  </form>`

  modalContent.appendChild(form)
  modalView.style.display = 'block'

  const url = window.location.pathname;
  localStorage.setItem('redirUrl', url)

  form.addEventListener("submit", (e) => {
    showloader()
    e.preventDefault()
      fetch (`${API_URL}/user/login/`, {
        method: 'POST',
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: e.target["uname"].value,
          password: e.target["psword"].value
      }),
    })
    .then((response) => response.json())
    .then((result) => {
      if(result.errors){
        hideloader()
        showInfoToast("Wrong credentials.")
        } else {
          hideloader()
          localStorage.setItem("token", result.token['access token'])
          localStorage.setItem("uName", result.user)
          localStorage.setItem("profileId", result.profileId)
          let redirUrl = localStorage.getItem("redirUrl")
          if (redirUrl) {
            localStorage.removeItem("redirUrl")
            window.open(redirUrl, '_self')
          } else {
            window.open(`/`, '_self')
          }        
        }
    }) .catch((err) => {
      console.log(err)
    })
  })
  
}

function setProgressbarBackToTop() {
  let progressBar = document.getElementById("progressBar")
  let backToTop = document.getElementById("backToTop")
  window.onscroll = () => onScrollAction(progressBar, backToTop)

  function onScrollAction(progressBar, backToTop) {
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + "%";
    if(scrolled > 8) backToTop.style.display = 'block'
    else backToTop.style.display = 'none'
  }
}

function somethingWrongMsg() {
  const topContainer = document.getElementById('container')
  let dataContainer = document.createElement('div')
  dataContainer.classList.add("box-shadow", "error")
  dataContainer.innerHTML = `Something went wrong. Please refresh the page.`
  topContainer.appendChild(dataContainer)
  hideloader();
  SetUserLoggedInDisplay()
}

function hideloader() {
  document.getElementById('progress-loader').style.visibility = 'hidden';
}
function showloader() {
  document.getElementById('progress-loader').style.visibility = 'visible';
}

function getNumFromURL(url) {
  // let numbers = url.replace(/[^0-9]/g, '');
  let nums = url.split('/');
  nums.shift();
  nums.shift();
  return nums
}

function createNextBtn(nextData, bottomNavBtns) {
  let nextBtn = document.createElement('a')
  nextBtn.classList.add("nextBtn", "link-btn")
  nextBtn.href = `/book/${nextData.nextUrl}`
  nextBtn.innerText = "Next"
  bottomNavBtns.appendChild(nextBtn)
}
function createPrevBtn(prevData, bottomNavBtns) {
  let prevBtn = document.createElement('a')
  prevBtn.classList.add("prevBtn", "link-btn")
  prevBtn.href = `/book/${prevData.previousUrl}`
  prevBtn.innerText = "Previous"
  bottomNavBtns.appendChild(prevBtn)
}


const url = window.location.pathname;
if (url === '/')
fetchAndDisplayBooks();
else if (url === '/index.html')
fetchAndDisplayBooks();
else if (/^\/book\/\d+$/.test(url))
fetchAndDisplayBookDetails(url)
else if (/^\/book\/\d+\/toc$/.test(url))
fetchAndDisplayBookTOC(url)
else if (/^\/book\/\d+\/\d+$/.test(url))
fetchAndDisplayChapterText(url)
else if (/^\/book\/\d+\/\d+\/\d+$/.test(url))
fetchAndDisplaySubhead1Text(url)
else if (/^\/book\/\d+\/\d+\/\d+\/\d+$/.test(url))
fetchAndDisplaySubhead2Text(url)
else if(url === '/login')
loginUser();
else if(url === '/register')
registerNewUser();
else if(url === '/profile')
profileSection();
else {
  let topContainer = document.getElementById('container')
  let dataContainer = document.createElement('div')
  dataContainer.classList.add("box-shadow", "error")
  dataContainer.innerHTML = `Something went wrong. Please try again.`
  topContainer.appendChild(dataContainer)
  hideloader();
  SetUserLoggedInDisplay()
}

let darkModeBtn = document.getElementById("darkModeBtn")

darkModeBtn.addEventListener('click', (e) => {
  e.target.innerText === "☀" ? disableDarkMode() : enableDarkMode()
})

let darkModeEnabled = localStorage.getItem("darkMode")
if(darkModeEnabled === "enabled") { enableDarkMode(); }

function enableDarkMode() {
  localStorage.setItem("darkMode", "enabled")
  darkModeBtn.innerText = "☀"
  let root = document.querySelector(':root');
  root.style.setProperty("--body-bg-color-theme-light", "#393939")
  root.style.setProperty("--header-bg-color-theme-light", "#555")
  root.style.setProperty("--global-bg-color", "#282828")
  root.style.setProperty("--global-text-color", "#fff")
  root.style.setProperty("--para-hover-color", "rgb(72, 71, 71)")
  root.style.setProperty("--breadcrumbs-boxshadow-color", "#f7f5f530")
  root.style.setProperty("--bookmarkbtn-boxshadow-color", "rgba(232, 232, 232, 0.5)")
}

function disableDarkMode() {
  localStorage.setItem("darkMode", "disabled")
  darkModeBtn.innerText = "☽"
  let root = document.querySelector(':root');
  root.style.setProperty("--body-bg-color-theme-light", "#f9faff")
  root.style.setProperty("--header-bg-color-theme-light", "#fff")
  root.style.setProperty("--global-bg-color", "#fff")
  root.style.setProperty("--global-text-color", "#000")
  root.style.setProperty("--para-hover-color", "rgb(232, 232, 232)")
  root.style.setProperty("--breadcrumbs-boxshadow-color", "#0000003b")
  root.style.setProperty("--bookmarkbtn-boxshadow-color", "rgba(117, 116, 116, 0.5)")
}

let burger = document.querySelector(".burger")
let navDrawer = document.querySelector("#nav-login")

burger.addEventListener('click', () => {
  burger.classList.toggle("toggle")
  navDrawer.classList.toggle("nav-open")
})

let fontSizeLocalStorage = localStorage.getItem("fontSize")
if(fontSizeLocalStorage) { 
  document.body.style.fontSize = fontSizeLocalStorage + 'px';
 }


let fontIncBtn = document.getElementById("increaseFont")
let fontDecBtn = document.getElementById("decreaseFont")

fontIncBtn.addEventListener('click', () => {
  let rootStyles = window.getComputedStyle(document.body).getPropertyValue('font-size');
  let fontSize = parseFloat(rootStyles);
  if(fontSize < 30){
    document.body.style.fontSize = (fontSize + 1) + 'px';
    localStorage.setItem("fontSize", fontSize+1)
  }
})
fontDecBtn.addEventListener('click', () => {
  let rootStyles = window.getComputedStyle(document.body).getPropertyValue('font-size');
  let fontSize = parseFloat(rootStyles);
  if(fontSize > 15)
  {
    document.body.style.fontSize = (fontSize - 1) + 'px';
    localStorage.setItem("fontSize", fontSize-1)
  }
})
