# CSS

# 🍉 101 Terminal CSS

```sh
docker run -i --init -p 8030:3000 busybox:1.35.0 <<\EOF
echo http://Ghost-in-the-Shell.localhost:8030
cat <<\EOOF > index.html
<html>
<head>
<title>busybox httpd 2022</title>
<script type="module" src="https://cdn.skypack.dev/twind/shim"></script>
</head>
<body>
<div class="w-full">
  <div class="coding inverse-toggle px-5 pt-4 shadow-lg text-gray-100 text-sm font-mono subpixel-antialiased 
              bg-gray-800  pb-6 pt-4 rounded-lg leading-normal overflow-hidden">
      <div class="mt-4 flex">
          <span class="text-green-400">dltdojo/cd22:~$</span>
          <p class="flex-1 typing items-center pl-2">
              docker run -i --init -p 8030:3000 busybox:1.35.0
              <br>
          </p>
      </div>
  </div>
</div>
</body>
</html>
EOOF
busybox httpd -fv -p 3000 
EOF
```
