// Art Collector
// const API = {
//     BASE_URL: 'https://api.harvardartmuseums.org',
//     KEY: 'apikey=54b2bbbd-5519-422d-b0cb-bbc67fe0512b', // USE YOUR KEY HERE  
// };

const API = 
{
    BASE_URL: 'https://api.harvardartmuseums.org',
    RESOURCES: 
    {
      OBJECT: 'object', 
      CLASSIFICATION: 'classification', 
      CENTURY: 'century',
    },
    KEY: 'apikey=54b2bbbd-5519-422d-b0cb-bbc67fe0512b'
};
 
// A BIT OF GOOD UI        
// Here, take a few functions:
  function onFetchStart() 
  {
    $('#loading').addClass('active');
  }
  
  function onFetchEnd() 
  {
    $('#loading').removeClass('active');
  }
// ^^ These will show/remove a modal indicating we are searching for something.
  
  async function fetchAllCenturies() 
  {
    if (localStorage.getItem('centuries')) 
    {
      return JSON.parse(localStorage.getItem('centuries'));
    }

    try 
    {
      const response = await fetch(`${ API.BASE_URL }/${ API.RESOURCES.CENTURY }?${ API.KEY }&size=100&sort=temporalorder`);

      // Now, you need to store them. Where can we do that? Right before we return them after successful fetch. 
      // Add a line to set the centuries item in localstorage after you get the records, but before returning them.
      let { info, records } = await response.json();
      localStorage.setItem('centuries', JSON.stringify(records));
        
      return records;
    } 
    catch (error) 
    {
      console.error(error);
    }
  }
  
  async function fetchAllClassifications() 
  {
    if (localStorage.getItem('classifications')) 
    {
      return JSON.parse(localStorage.getItem('classifications'));
    }
    try 
    {
      const response = await fetch(`${ API.BASE_URL }/${ API.RESOURCES.CLASSIFICATION }?${ API.KEY }&size=100&sort=name`);
      // Now, you need to store them. Where can we do that? Right before we return them after successful fetch. 
      // Add a line to set the centuries item in localstorage after you get the records, but before returning them.
      let { info, records } = await response.json();
      localStorage.setItem('classifications', JSON.stringify(records));
  
      return records;
    } 
    catch (error) 
    {
      console.error(error);
    }
  }
  
  async function prefetchCategoryLists() 
  {
    try 
    {
      const 
      [
        classifications, centuries
      ] = await Promise.all([
        fetchAllClassifications(),
        fetchAllCenturies()
      ]);
      
      // ClassificationsArray
      // Ok, so we have our data, let's populate the dropdowns. 
      // Inside the function we need to loop over the two captured arrays, create an <option> tag for each item in them.
      $('.classification-count').text(`(${ classifications.length })`);
      classifications.forEach(classification => 
      {
        $('#select-classification').append($(`<option value="${ classification.name }">${ classification.name }</option>`));
      });
      
      // CenturiesArray
      // Ok, so we have our data, let's populate the dropdowns. 
      // Inside the function we need to loop over the two captured arrays, create an <option> tag for each item in them.
      $('.century-count').text(`(${ centuries.length })`);
      centuries.forEach(century => 
      {
        $('#select-century').append($(`<option value="${ century.name }">${ century.name }</option>`));
      });
    } 
    catch (error) 
    {
      console.error(error);
    }
  }
  
  function buildSearchString() 
  {
    // https://api.harvardartmuseums.org /object ?apikey=YOUR_KEY_HERE &classification=Photographs&century=19th century &keyword=face
    const searchUrl = `${ API.BASE_URL }/${ API.RESOURCES.OBJECT }?${ API.KEY }`;
  
    const classificationsAndCenturies = [...$('#search select')].map(el => 
      {
      return `${ $(el).attr('name') }=${ $(el).val() }`
      }
    ).join('&');
    
    let keywords = `keyword=${ $('#keywords').val() }`;
  
    return `${ searchUrl }&${ classificationsAndCenturies }&${ keywords }`
  }
  
  function updatePreview(records, info) 
  {
    const root = $('#preview');
    
    // Go back to updatePreview, we need to enable/disable the .next and .previous buttons depending on which keys are present, 
    // and attach the search URLs to the buttons so that, when pressed, we can start the next search.
    if (info.next) 
    {
      root.find('.next')
        .data('url', info.next)
        .attr('disabled', false);
    } 
    else 
    {
      root.find('.next')
        .data('url', null)
        .attr('disabled', true);
    }
    if (info.prev) 
    {
      root.find('.previous')
        .data('url', info.prev)
        .attr('disabled', false);
    } 
    else 
    {
      root.find('.previous')
        .data('url', null)
        .attr('disabled', true);
    }
    
    const resultsEl = root.find('.results');
    resultsEl.empty();
  
    records.forEach(objectRecord => 
      {
      resultsEl.append(
        renderPreview(objectRecord)
        );
      }
    );
  
    resultsEl.animate({ scrollTop: 0 }, 500);
  }
  
  // POPULATING THE ASIDE
  function renderPreview(objectRecord) 
  {
    // destructured
    const 
    {
      description,
      primaryimageurl,
      title,
    } = objectRecord;
  
    return $(`<div class="object-preview">
      <a href="#">
      ${
        primaryimageurl && title
        ? `<img src="${ primaryimageurl }" /><h3>${ title }<h3>`
        : title
        ? `<h3>${ title }<h3>`
        : description
        ? `<h3>${ description }<h3>`
        : `<img src="${ primaryimageurl }" />`
      }
      </a>
    </div>`).data('objectRecord', objectRecord);
  }

  // POPULATING THE ASIDE
  function renderFeature(objectRecord) 
  {
    console.log('objectRecord is: ', objectRecord);
    // destructured
    const 
    { 
      title, 
      dated,
      images,
      primaryimageurl,
      description,
      culture,
      style,
      technique,
      medium,
      dimensions,
      people,
      department,
      division,
      contact,
      creditline,
    } = objectRecord;
  
    // PUT THE FACTS IN THE TEMPLATE
    // Go back to renderFeature and use factHTML to add facts for each of the facts: 
    // description, culture, style, technique, medium, dimensions, people, department, division, contact, and creditline.
    // When we get to the people, we can use .map in our template to iterate over them.
    return $(`<div class="object-feature">
      <header>
        <h3>${ title }<h3>
        <h4>${ dated }</h4>
      </header>
          <section class="facts">
            ${ factHTML('Description', description) }
            ${ factHTML('Culture', culture, 'culture') }
            ${ factHTML('Style', style) }
            ${ factHTML('Technique', technique, 'technique' )}
            ${ factHTML('Medium', medium ? medium.toLowerCase() : null, 'medium') }
            ${ factHTML('Dimensions', dimensions) }
            ${ 
              people 
              ? people.map(
                  person => factHTML('Person', person.displayname, 'person')
                ).join('')
              : ''
            }
            ${ factHTML('Department', department) }
            ${ factHTML('Division', division) }
            ${ factHTML('Contact', `<a target="_blank" href="mailto:${ contact }">${ contact }</a>`) }
            ${ factHTML('Credit', creditline) }
          </section>

      <section class="photos">
        ${ photosHTML(images, primaryimageurl) }
      </section>
    </div>`);
  }
  
  function factHTML(title, content, searchTerm = null) 
  {
    console.log('searchTerm is: ', searchTerm, 'content is: ', content);
    if (!content) 
    {
      return ''
    }
  
    return `
      <span class="title">${ title }</span>
      
      <span class="content">${
        searchTerm && content
        ? `<a href="${ 
           API.BASE_URL 
          }/${
           API.RESOURCES.OBJECT 
          }?${
            API.KEY
          }&${ 
            searchTerm 
          }=${ 
            encodeURI(content.split('-').join('|')) 
          }">${ 
            content
          }</a>`
        : content
      } 
      </span>
    `
  }
  
  function photosHTML(images, primaryimageurl) 
  {
    // if images is defined AND images.length > 0, map the images to the correct image tags, then join them into a single string.  
    // the images have a property called baseimageurl, use that as the value for src
    if (images.length > 0) 
    {
      return images.map(
        image => `<img src="${ image.baseimageurl }" />`).join('');
    } 
    // else if primaryimageurl is defined, return a single image tag with that as value for src
    else if (primaryimageurl) 
    {
      return `<img src="${ primaryimageurl }" />`;
    } 
    // else we have nothing, so return the empty string
    else 
    {
      return '';
    }
  }
  

// INTERACTIVITY 
  $('#search').on('submit', async function (event) 
  {
    // Prevent the Default
    event.preventDefault();
    onFetchStart();
  
    try 
    {
      // get the url from `buildSearchString`
      // fetch it with await
      const response = await fetch(buildSearchString());
      // store the result
      // log out both info and records when you get them
      const { records, info } = await response.json();  

      updatePreview(records, info);
    } 
    catch (error) 
    {
      console.error(error);
    } 
    finally 
    {
      onFetchEnd();
    }
  });
  

  $('#preview .next, #preview .previous').on('click', async function () 
  {
    onFetchStart();
  
    try 
    {
      // read off url from the target 
      const url = $(this).data('url');
      // fetch the url
      const response = await fetch(url);
      // read the records and info from the response.json()
      const { records, info } = await response.json();  
      
      // update the preview
      updatePreview(records, info);
    } 
    catch (error) 
    {
      console.error(error);
    } 
    finally 
    {
      onFetchEnd();
    }
  });
  

  $('#preview').on('click', '.object-preview', function (event) 
  {
    // they're anchor tags, so don't follow the link
    event.preventDefault();

    // find the '.object-preview' element by using .closest() from the target
    // recover the record from the element using the .data('record') we attached
    let objectRecord = $(this).data('objectRecord');

    // log out the record object to see the shape of the data
    console.log('objectRecord is: ', objectRecord);
    
    // NEW => set the html() on the '#feature' element to renderFeature()
    let featureEl = $('#feature');
    featureEl.html( renderFeature(objectRecord) );  
  });
  

  $('#feature').on('click', 'a', async function (event) 
  {
    // read href off of $(this) with the .attr() method
    const href = $(this).attr('href');
  
    // One of our fields is a contact email... we don't want to search when that is the case.
  
    if (href.startsWith('mailto:')) 
    {
      return;
    }
    // Right before the preventDefault, check to see if the href starts with "mailto:"... if it does, 
    // just return early from the click function.

    // prevent default
    event.preventDefault();
  
    // call onFetchStart
    onFetchStart();
    try 
    {
      // fetch the href
      let result = await fetch(href);
      let { records, info } = await result.json();
      // render it into the preview
      updatePreview(records, info);
    } 
    catch (error) 
    {
      console.error(error)
    } 
    finally 
    {
      // call onFetchEnd
      onFetchEnd();
    }
  });
  
  prefetchCategoryLists();



